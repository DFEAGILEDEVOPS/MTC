import { ICheckNotificationMessage, CheckNotificationType } from './check-notification-message'

export class CheckNotifier {
  private checkNotifierDataService: ICheckNotifierDataService

  constructor (checkNotifierDataService?: ICheckNotifierDataService) {
    if (checkNotifierDataService === undefined) {
      checkNotifierDataService = new CheckNotifierDataService()
    }
    this.checkNotifierDataService = checkNotifierDataService
  }

  async notify (notification: ICheckNotificationMessage) {
    return this.checkNotifierDataService.updateCheckAsComplete(notification.checkCode)
  }
}

export class CheckNotifierDataService implements ICheckNotifierDataService {
  updateCheckAsComplete (checkCode: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export interface ICheckNotifierDataService {
  updateCheckAsComplete (checkCode: string): Promise<void>
}

const CheckNotifierDataServiceMock = jest.fn<ICheckNotifierDataService, any>(() => ({
  updateCheckAsComplete: jest.fn()
}))

let sut: CheckNotifier
let dataServiceMock: ICheckNotifierDataService

describe('check-notifier/v1', () => {

  beforeEach(() => {
    dataServiceMock = new CheckNotifierDataServiceMock()
    sut = new CheckNotifier(dataServiceMock)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('checkComplete notification should update check as complete', async () => {
    await sut.notify({
      notificationType: CheckNotificationType.checkComplete,
      checkCode: 'code',
      version: 1
    })
    expect(dataServiceMock.updateCheckAsComplete).toHaveBeenCalledTimes(1)
    expect(dataServiceMock.updateCheckAsComplete).toHaveBeenCalledWith('code')
  })
})
