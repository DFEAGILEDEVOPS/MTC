import { CheckNotificationType, ICheckNotificationMessage } from '../../schemas/check-notification-message'
import { CheckNotifierDataService, ICheckNotifierDataService } from './check-notifier.data.service'

export class CheckNotifier {
  private readonly checkNotifierDataService: ICheckNotifierDataService

  constructor (checkNotifierDataService?: ICheckNotifierDataService) {
    if (checkNotifierDataService === undefined) {
      checkNotifierDataService = new CheckNotifierDataService()
    }
    this.checkNotifierDataService = checkNotifierDataService
  }

  async notify (notification: ICheckNotificationMessage): Promise<void> {
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
