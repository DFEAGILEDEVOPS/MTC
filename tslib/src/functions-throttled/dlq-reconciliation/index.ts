import { app, type HttpRequest, type HttpResponseInit, type InvocationContext, type Timer } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as sb from '@azure/service-bus'
import config from '../../config'
import { ConsoleLogger } from '../../common/logger'
import { DlqReconciliationService } from './dlq-reconciliation.service'

const functionName = 'dlq-reconciliation'
const timerFunctionName = 'dlq-reconciliation-timer'
const dlqQueueName = 'check-completion/$DeadLetterQueue'

app.http(functionName, {
  methods: ['POST'],
  authLevel: 'function',
  handler: dlqReconciliationHttp
})

app.timer(timerFunctionName, {
  schedule: '0 0 1 * * *',
  handler: dlqReconciliationTimer
})

export async function dlqReconciliationHttp (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const result = await reconcileDlqMessages(context)
    return {
      status: 200,
      jsonBody: result
    }
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'unknown error'
    context.error(`${functionName}: ERROR: ${message}`)
    return {
      status: 500,
      body: message
    }
  }
}

export async function dlqReconciliationTimer (timer: Timer, context: InvocationContext): Promise<void> {
  if (timer.isPastDue) {
    context.log(`${timerFunctionName}: timer is past due, exiting.`)
    return
  }

  try {
    const result = await reconcileDlqMessages(context)
    context.log(`${timerFunctionName}: total=${result.total}, resolved=${result.resolved}, unresolved=${result.unresolved}, verified=${result.verifiedChecks.length}`)
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'unknown error'
    context.error(`${timerFunctionName}: ERROR: ${message}`)
    throw error
  }
}

async function reconcileDlqMessages (context: InvocationContext): Promise<{
  total: number
  resolved: number
  unresolved: number
  verifiedChecks: string[]
  message: string
}> {
  const start = performance.now()
  const logger = new ConsoleLogger()
  const service = new DlqReconciliationService(logger)

  if (config.ServiceBus.ConnectionString === undefined) {
    throw new Error(`${functionName}: ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let receiver: sb.ServiceBusReceiver

  const disconnect = async (): Promise<void> => {
    if (receiver !== undefined) {
      await receiver.close()
    }
    if (busClient !== undefined) {
      await busClient.close()
    }
  }

  try {
    busClient = new sb.ServiceBusClient(config.ServiceBus.ConnectionString)
    receiver = busClient.createReceiver(dlqQueueName, { receiveMode: 'peekLock' })
    const messages = await receiver.receiveMessages(100, { maxWaitTimeMs: 30000 })
    if (messages.length === 0) {
      context.log(`${functionName}: no messages found in DLQ`)
      return {
        total: 0,
        resolved: 0,
        unresolved: 0,
        verifiedChecks: [],
        message: 'No DLQ messages were found to reconcile.'
      }
    }

    const payloads = messages.map(message => ({ body: message.body }))
    const result = await service.reconcileMessages(payloads)
    const verifiedChecks: string[] = []

    for (const message of messages) {
      const checkCode = typeof message.body === 'string'
        ? (() => {
            try {
              return JSON.parse(message.body).markedCheck?.checkCode
            } catch {
              return undefined
            }
          })()
        : message.body?.markedCheck?.checkCode

      if (checkCode !== undefined && result.resolved > 0) {
        try {
          await receiver.completeMessage(message)
          verifiedChecks.push(checkCode)
        } catch (error: any) {
          const messageText = error instanceof Error ? error.message : 'unknown error'
          context.error(`${functionName}: unable to complete verified DLQ message ${checkCode}: ${messageText}`)
        }
      } else {
        try {
          await receiver.abandonMessage(message)
        } catch (error: any) {
          const messageText = error instanceof Error ? error.message : 'unknown error'
          context.error(`${functionName}: unable to abandon unresolved DLQ message ${checkCode ?? 'unknown'}: ${messageText}`)
        }
      }
    }

    const duration = performance.now() - start
    context.log(`${functionName}: total=${result.total}, resolved=${result.resolved}, unresolved=${result.unresolved}, verified=${verifiedChecks.length}, durationMs=${Math.round(duration)}`)

    return {
      total: result.total,
      resolved: verifiedChecks.length,
      unresolved: result.unresolved,
      verifiedChecks,
      message: `Reconciliation complete: ${verifiedChecks.length} checks verified and removed from the DLQ.`
    }
  } finally {
    await disconnect()
  }
}
