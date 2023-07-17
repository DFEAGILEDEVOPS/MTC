import { type ICheckNotificationMessage, CheckNotificationType } from '../../schemas/check-notification-message'
import { type IBatchCheckNotifierDataService, BatchCheckNotifierDataService } from './batch-check-notifier.data.service'
import { type ITransactionRequest } from '../../sql/sql.service'

export class BatchCheckNotifier {
  private readonly dataService: IBatchCheckNotifierDataService

  constructor (batchCheckNotifierDataService?: IBatchCheckNotifierDataService) {
    if (batchCheckNotifierDataService === undefined) {
      batchCheckNotifierDataService = new BatchCheckNotifierDataService()
    }
    this.dataService = batchCheckNotifierDataService
  }

  async notify (messages: ICheckNotificationMessage[]): Promise<void> {
    const requests: ITransactionRequest[] = []
    messages.forEach(message => {
      switch (message.notificationType) {
        case CheckNotificationType.checkComplete:
          requests.push(...this.dataService.createCheckCompleteRequest(message.checkCode))
          break
        case CheckNotificationType.checkInvalid:
          requests.push(this.dataService.createProcessingFailedRequest(message.checkCode))
          break
        case CheckNotificationType.checkReceived:
          requests.push(this.dataService.createCheckReceivedRequest(message.checkCode))
          break
      }
    })
    return this.dataService.executeRequestsInTransaction(requests)
  }
}
