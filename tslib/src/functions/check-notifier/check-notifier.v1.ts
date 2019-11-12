import { ICheckNotificationMessage, CheckNotificationType } from './check-notification-message'
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
      case CheckNotificationType.checkInvalid:
        throw new Error('not yet implemented')
      case CheckNotificationType.checkComplete:
        return this.checkNotifierDataService.updateCheckAsComplete(notification.checkCode)
    }
  }
}

export enum CheckStatus {
  New = 1,
  // Expired = 2, To be removed
  Complete = 3,
  Started = 4,
  Collected = 5,
  NotReceived = 6
}
