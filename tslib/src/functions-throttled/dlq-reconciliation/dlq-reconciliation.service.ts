import { type ServiceBusReceiver, type ServiceBusReceivedMessage } from '@azure/service-bus'
import { validate as isUuid } from 'uuid'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import { DlqReconciliationDataService } from './dlq-reconciliation.data.service'
import { type ReconciliationItem } from './models'

type Receiver = Pick<ServiceBusReceiver, 'peekMessages' | 'receiveMessages' | 'completeMessage' | 'abandonMessage'>
type Store = Pick<DlqReconciliationDataService, 'isSynchronised' | 'recordInventory' | 'recordOutcome' | 'heartbeat'>
interface Limits { maxMessages?: number, maxDurationMs?: number }
interface Result { status: 'Completed' | 'Partial', message: string }

export class DlqReconciliationService {
  constructor (
    private readonly logger: ILogger = new ConsoleLogger(),
    private readonly dataService: Store = new DlqReconciliationDataService()
  ) {}

  private sequence (message: ServiceBusReceivedMessage): NonNullable<ServiceBusReceivedMessage['sequenceNumber']> {
    if (message.sequenceNumber === undefined) throw new Error('Service Bus message has no sequence number')
    return message.sequenceNumber
  }

  private identify (message: ServiceBusReceivedMessage): ReconciliationItem {
    const item: ReconciliationItem = {
      sequenceNumber: this.sequence(message).toString(),
      messageId: String(message.messageId),
      submittedAt: message.enqueuedTimeUtc?.toISOString() ?? null,
      outcome: 'Retained: invalid submission envelope'
    }
    const body: unknown = Buffer.isBuffer(message.body) ? message.body.toString('utf8') : message.body
    let parsed: unknown = body
    if (typeof body === 'string') {
      try {
        parsed = JSON.parse(body)
      } catch {
        return item
      }
    }
    if (typeof parsed !== 'object' || parsed === null) {
      return item
    }
    if ('checkCode' in parsed && typeof parsed.checkCode === 'string' && isUuid(parsed.checkCode)) {
      item.checkCode = parsed.checkCode.toLowerCase()
    }
    if ('schoolUUID' in parsed && typeof parsed.schoolUUID === 'string' && isUuid(parsed.schoolUUID)) {
      item.schoolUUID = parsed.schoolUUID.toLowerCase()
    }
    if (item.checkCode !== undefined && item.schoolUUID !== undefined) item.outcome = 'Pending'
    return item
  }

  async preview (receiver: Receiver, runId: string, limits: Limits = {}): Promise<Result> {
    const deadline = Date.now() + (limits.maxDurationMs ?? 120000)
    const maximum = limits.maxMessages ?? 1000
    let cursor: ServiceBusReceivedMessage['sequenceNumber'] | undefined
    let count = 0
    let failed = false
    while (Date.now() < deadline) {
      await this.dataService.heartbeat(runId)
      const messages = await receiver.peekMessages(Math.min(100, maximum - count + 1), { fromSequenceNumber: cursor })
      if (messages.length === 0) {
        return { status: failed ? 'Partial' : 'Completed', message: failed ? 'Preview contains verification failures; no messages removed.' : 'Preview complete. No messages removed.' }
      }
      const items: ReconciliationItem[] = []
      for (const message of messages.slice(0, maximum - count)) {
        if (Date.now() >= deadline) break
        const item = this.identify(message)
        if (item.outcome === 'Pending' && item.checkCode !== undefined && item.schoolUUID !== undefined) {
          try {
            item.outcome = await this.dataService.isSynchronised(item.checkCode, item.schoolUUID)
              ? 'Eligible' : 'Retained: no matching successful SQL result'
          } catch (error) {
            item.outcome = 'Failed: SQL verification unavailable'
            failed = true
            this.logger.error('dlq-reconciliation: preview verification failed', error)
          }
        }
        items.push(item)
      }
      if (items.length > 0) await this.dataService.recordInventory(runId, items)
      count += items.length
      if (messages.length > items.length || Date.now() >= deadline) break
      cursor = this.sequence(messages[messages.length - 1]).add(1)
    }
    return { status: 'Partial', message: 'Preview reached its time or 1,000-message limit. No messages removed.' }
  }

  async cleanup (receiver: Receiver, runId: string, preview: ReconciliationItem[], limits: Limits = {}): Promise<Result> {
    const maximum = limits.maxMessages ?? 1000
    if (preview.length > maximum) throw new Error('Preview exceeds the cleanup limit')
    const deadline = Date.now() + (limits.maxDurationMs ?? 120000)
    const inventory = preview.map(item => ({
      ...item,
      checkCode: item.checkCode?.toLowerCase(),
      schoolUUID: item.schoolUUID?.toLowerCase(),
      outcome: item.outcome === 'Eligible' ? 'Pending' : item.outcome
    }))
    if (inventory.length > 0) await this.dataService.recordInventory(runId, inventory)
    const pending = new Map(inventory.filter(item => item.outcome === 'Pending').map(item => [item.sequenceNumber, item]))
    const held = new Set<ServiceBusReceivedMessage>()
    const seen = new Set<string>()
    let receivedCount = 0
    let failed = false
    try {
      while (pending.size > 0 && Date.now() < deadline && receivedCount < maximum) {
        await this.dataService.heartbeat(runId)
        const messages = await receiver.receiveMessages(Math.min(100, maximum - receivedCount), { maxWaitTimeInMs: 1000 })
        if (messages.length === 0) break
        receivedCount += messages.length
        for (const message of messages) held.add(message)
        for (const message of messages) {
          if (Date.now() >= deadline) break
          const sequenceNumber = this.sequence(message).toString()
          if (seen.has(sequenceNumber)) {
            failed = true
            continue
          }
          seen.add(sequenceNumber)
          const item = pending.get(sequenceNumber)
          if (item === undefined) continue
          const current = this.identify(message)
          if (current.outcome !== 'Pending' || item.checkCode === undefined || item.schoolUUID === undefined ||
            current.checkCode !== item.checkCode || current.schoolUUID !== item.schoolUUID) {
            item.outcome = 'Retained: message identity differs from preview'
          } else {
            try {
              const synchronised = await this.dataService.isSynchronised(item.checkCode, item.schoolUUID)
              item.outcome = synchronised ? 'Unknown: removal pending confirmation' : 'Retained: no matching successful SQL result'
            } catch (error) {
              item.outcome = 'Failed: SQL verification unavailable'
              failed = true
              this.logger.error('dlq-reconciliation: cleanup verification failed', error)
            }
          }
          await this.dataService.recordOutcome(runId, item)
          if (item.outcome === 'Unknown: removal pending confirmation') {
            try {
              await receiver.completeMessage(message)
              held.delete(message)
            } catch (error) {
              failed = true
              this.logger.error(`dlq-reconciliation: removal unconfirmed for sequence ${sequenceNumber}`, error)
            }
            if (!held.has(message)) {
              item.outcome = 'Removed'
              await this.dataService.recordOutcome(runId, item)
            }
          }
          pending.delete(sequenceNumber)
        }
      }
    } finally {
      for (const message of held) {
        try {
          await receiver.abandonMessage(message)
        } catch (error) {
          failed = true
          this.logger.error('dlq-reconciliation: unable to release message lock', error)
        }
      }
    }
    const partial = pending.size > 0 || failed
    return {
      status: partial ? 'Partial' : 'Completed',
      message: partial ? 'Cleanup incomplete. Review pending and unconfirmed items before retrying.' : 'Cleanup complete. Only previewed, reverified messages were removed.'
    }
  }
}