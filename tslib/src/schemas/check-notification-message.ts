export interface ICheckNotificationMessage {
  notificationType: CheckNotificationType
  checkCode: string
  version: number
}

export enum CheckNotificationType {
  checkComplete = 'checkComplete',
  checkInvalid = 'checkInvalid',
  checkReceived = 'checkReceived'
}
