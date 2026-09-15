import { type ILogger, ConsoleLogger } from '../../common/logger'
import { type IDlqReconciliationDataService, DlqReconciliationDataService } from './dlq-reconciliation.data.service'

export interface IDlqReconciliationResult {
  total: number
  resolved: number
  unresolved: number
}

export interface IDlqMessage {
  body?: unknown
}

export class DlqReconciliationService {
  private readonly logger: ILogger
  private readonly dataService: IDlqReconciliationDataService

  constructor (logger?: ILogger, dataService?: IDlqReconciliationDataService) {
    this.logger = logger ?? new ConsoleLogger()
    this.dataService = dataService ?? new DlqReconciliationDataService()
  }

  private extractCheckCode (message: IDlqMessage): string | undefined {
    const rawBody = message.body
    if (rawBody == null) {
      return undefined
    }

    let parsed: any = rawBody
    if (typeof rawBody === 'string') {
      try {
        parsed = JSON.parse(rawBody)
      } catch (error) {
        this.logger.warn('Unable to parse dead-letter message body as JSON')
        return undefined
      }
    }

    const candidate = parsed?.markedCheck?.checkCode ?? parsed?.checkCode ?? parsed?.body?.markedCheck?.checkCode
    return typeof candidate === 'string' && candidate.length > 0 ? candidate : undefined
  }

  async reconcileMessages (messages: IDlqMessage[]): Promise<IDlqReconciliationResult> {
    const result: IDlqReconciliationResult = { total: messages.length, resolved: 0, unresolved: 0 }

    for (const message of messages) {
      const checkCode = this.extractCheckCode(message)
      if (checkCode === undefined) {
        result.unresolved += 1
        continue
      }

      const syncStatus = await this.dataService.getCheckSyncStatus(checkCode)
      if (syncStatus?.resultsSynchronised === 1 || syncStatus?.resultsSynchronised === true) {
        result.resolved += 1
      } else {
        result.unresolved += 1
      }
    }

    return result
  }
}
