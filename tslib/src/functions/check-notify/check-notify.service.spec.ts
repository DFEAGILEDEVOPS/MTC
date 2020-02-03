import { CheckNotificationType } from '../check-notifier/check-notification-message'
import { ICheckNotifyDataService } from './check-notify.data.service'
import { BatchCheckNotifier } from './check-notify.service'

const CheckNotifyDataServiceMock = jest.fn<ICheckNotifyDataService, any>(() => ({
  createProcessingFailedRequest: jest.fn(),
  createCheckReceivedRequest: jest.fn(),
  createCheckCompleteRequest: jest.fn(),
  executeRequestsInTransaction: jest.fn()
}))

let sut: BatchCheckNotifier
let dataService: ICheckNotifyDataService

describe('check-notifier/v2', () => {

  beforeEach(() => {
    dataService = new CheckNotifyDataServiceMock()
    sut = new BatchCheckNotifier(dataService)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('checkComplete notification type should create corresponding requests and be executed', async () => {
    dataService.createCheckCompleteRequest = jest.fn(() => {
      return [
        {
          sql: '',
          params: []
        }
      ]
    })
    await sut.notify([{
      notificationType: CheckNotificationType.checkComplete,
      checkCode: 'code',
      version: 2
    }])
    expect(dataService.createCheckCompleteRequest).toHaveBeenCalledTimes(1)
    expect(dataService.executeRequestsInTransaction).toHaveBeenCalledTimes(1)
  })

  test('checkInvalid notification type should create corresponding requests and be executed', async () => {
    await sut.notify([{
      notificationType: CheckNotificationType.checkInvalid,
      checkCode: 'code',
      version: 2
    }])
    expect(dataService.createProcessingFailedRequest).toHaveBeenCalledTimes(1)
    expect(dataService.executeRequestsInTransaction).toHaveBeenCalledTimes(1)
  })

  test('checkReceived notification type should create corresponding requests and be executed', async () => {
    await sut.notify([{
      notificationType: CheckNotificationType.checkReceived,
      checkCode: 'code',
      version: 2
    }])
    expect(dataService.createCheckReceivedRequest).toHaveBeenCalledTimes(1)
    expect(dataService.executeRequestsInTransaction).toHaveBeenCalledTimes(1)
  })

})
