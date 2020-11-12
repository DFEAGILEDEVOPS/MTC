import { CheckNotificationType } from '../../schemas/check-notification-message'
import { CheckNotifier } from './check-notifier.v1'
import { ICheckNotifierDataService } from './check-notifier.data.service'

const CheckNotifierDataServiceMock = jest.fn<ICheckNotifierDataService, any>(() => ({
  updateCheckAsComplete: jest.fn(),
  markCheckAsProcessingFailed: jest.fn(),
  markCheckAsReceived: jest.fn()
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

  test('checkInvalid notification should update check as processing failed', async () => {
    await sut.notify({
      notificationType: CheckNotificationType.checkInvalid,
      checkCode: 'code',
      version: 1
    })
    expect(dataServiceMock.markCheckAsProcessingFailed).toHaveBeenCalledTimes(1)
    expect(dataServiceMock.markCheckAsProcessingFailed).toHaveBeenCalledWith('code')
  })

  test('checkReceived notification should update check as received', async () => {
    await sut.notify({
      notificationType: CheckNotificationType.checkReceived,
      checkCode: 'code',
      version: 1
    })
    expect(dataServiceMock.markCheckAsReceived).toHaveBeenCalledTimes(1)
    expect(dataServiceMock.markCheckAsReceived).toHaveBeenCalledWith('code')
  })
})
