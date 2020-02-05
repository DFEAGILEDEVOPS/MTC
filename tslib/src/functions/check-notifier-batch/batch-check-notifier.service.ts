import { ICheckNotificationMessage, CheckNotificationType } from '../check-notifier/check-notification-message'
import { IBatchCheckNotifierDataService, BatchCheckNotifierDataService } from './batch-check-notifier.data.service'
import { ITransactionRequest } from '../../sql/sql.service'

export class BatchCheckNotifier {

  private dataService: IBatchCheckNotifierDataService

  constructor (batchCheckNotifierDataService?: IBatchCheckNotifierDataService) {
    if (batchCheckNotifierDataService === undefined) {
      batchCheckNotifierDataService = new BatchCheckNotifierDataService()
    }
    this.dataService = batchCheckNotifierDataService
  }

  notify (messages: ICheckNotificationMessage[]): Promise<void> {
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
