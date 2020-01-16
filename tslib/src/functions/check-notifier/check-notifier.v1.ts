import { CheckNotificationType, ICheckNotificationMessage } from './check-notification-message'
import { CheckNotifierDataService, ICheckNotifierDataService } from './check-notifier.data.service'

export class CheckNotifier {
  private checkNotifierDataService: ICheckNotifierDataService

  constructor (checkNotifierDataService?: ICheckNotifierDataService) {
    if (checkNotifierDataService === undefined) {
      checkNotifierDataService = new CheckNotifierDataService()
    }
    this.checkNotifierDataService = checkNotifierDataService
  }

  async notify (notification: ICheckNotificationMessage) {
    switch (notification.notificationType) {
      case CheckNotificationType.checkReceived:
        return this.checkNotifierDataService.markCheckAsReceived(notification.checkCode)
      case CheckNotificationType.checkInvalid:
        return this.checkNotifierDataService.markCheckAsProcessingFailed(notification.checkCode)
      case CheckNotificationType.checkComplete:
        return this.checkNotifierDataService.updateCheckAsComplete(notification.checkCode)
    }
  }
}
