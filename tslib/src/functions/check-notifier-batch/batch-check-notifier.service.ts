import { type ICheckNotificationMessage, CheckNotificationType } from '../../schemas/check-notification-message'
import { type IBatchCheckNotifierDataService, BatchCheckNotifierDataService } from './batch-check-notifier.data.service'
import { type ITransactionRequest } from '../../sql/sql.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'

export class BatchCheckNotifier {
  private readonly dataService: IBatchCheckNotifierDataService
  private readonly logService: ILogger

  constructor (batchCheckNotifierDataService?: IBatchCheckNotifierDataService, logger?: ILogger) {
    this.logService = logger ?? new ConsoleLogger()
    this.dataService = batchCheckNotifierDataService ?? new BatchCheckNotifierDataService(this.logService)
  }

  async notify (messages: ICheckNotificationMessage[]): Promise<void> {
    const requests: ITransactionRequest[] = []
    for (const message of messages) {
      switch (message.notificationType) {
        case CheckNotificationType.checkComplete:
        {
          const req = await this.dataService.createCheckCompleteRequest(message.checkCode)
          requests.push(...req)
          break
        }
        case CheckNotificationType.checkInvalid:
          requests.push(this.dataService.createProcessingFailedRequest(message.checkCode))
          break
        case CheckNotificationType.checkReceived:
          requests.push(this.dataService.createCheckReceivedRequest(message.checkCode))
          break
      }
    }
    return this.dataService.executeRequestsInTransaction(requests)
  }
}
