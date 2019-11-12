import { CheckNotificationType } from './check-notification-message'
import { CheckNotifier } from './check-notifier.v1'
import { ICheckNotifierDataService } from './check-notifier.data.service'

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

  test('checkInvalid notification should throw an error, as not yet implemented', async () => {
    try {
      await sut.notify({
        notificationType: CheckNotificationType.checkInvalid,
        checkCode: 'code',
        version: 1
      })
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe('not yet implemented')
      expect(dataServiceMock.updateCheckAsComplete).not.toHaveBeenCalled()
    }
  })
})
