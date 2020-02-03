import { CheckNotificationType } from '../check-notifier/check-notification-message'
import { IBatchCheckNotifierDataService } from './batch-check-notifier.data.service'
import { BatchCheckNotifier } from './batch-check-notifier.service'
import { ITransactionRequest } from '../../sql/sql.service'

const CheckNotifyDataServiceMock = jest.fn<IBatchCheckNotifierDataService, any>(() => ({
  createProcessingFailedRequest: jest.fn(),
  createCheckReceivedRequest: jest.fn(),
  createCheckCompleteRequest: jest.fn(),
  executeRequestsInTransaction: jest.fn()
}))

let sut: BatchCheckNotifier
let dataService: IBatchCheckNotifierDataService

describe('check-notifier/v2', () => {

  beforeEach(() => {
    dataService = new CheckNotifyDataServiceMock()
    sut = new BatchCheckNotifier(dataService)
    dataService.createCheckCompleteRequest = jest.fn(() => {
      return [
        {
          sql: '',
          params: []
        },
        {
          sql: '',
          params: []
        }
      ]
    })
    dataService.createCheckReceivedRequest = jest.fn(() => {
      return {
        sql: '',
        params: []
      }
    })
    dataService.createProcessingFailedRequest = jest.fn(() => {
      return {
        sql: '',
        params: []
      }
    })
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('checkComplete notification type should create corresponding requests and be executed', async () => {
    await sut.notify([{
      notificationType: CheckNotificationType.checkComplete,
      checkCode: 'code',
      version: 1
    }])
    expect(dataService.createCheckCompleteRequest).toHaveBeenCalledTimes(1)
    expect(dataService.executeRequestsInTransaction).toHaveBeenCalledTimes(1)
  })

  test('checkInvalid notification type should create corresponding requests and be executed', async () => {
    await sut.notify([{
      notificationType: CheckNotificationType.checkInvalid,
      checkCode: 'code',
      version: 1
    }])
    expect(dataService.createProcessingFailedRequest).toHaveBeenCalledTimes(1)
    expect(dataService.executeRequestsInTransaction).toHaveBeenCalledTimes(1)
  })

  test('checkReceived notification type should create corresponding requests and be executed', async () => {
    await sut.notify([{
      notificationType: CheckNotificationType.checkReceived,
      checkCode: 'code',
      version: 1
    }])
    expect(dataService.createCheckReceivedRequest).toHaveBeenCalledTimes(1)
    expect(dataService.executeRequestsInTransaction).toHaveBeenCalledTimes(1)
  })

  test('processing multiple message should create corresponding number of requests', async () => {
    let createdRequests: ITransactionRequest[] = []
    dataService.executeRequestsInTransaction = jest.fn(async (requests) => {
      createdRequests = requests
    })
    await sut.notify([
      { // creates 2 requests
        notificationType: CheckNotificationType.checkComplete,
        checkCode: 'code',
        version: 1
      },
      { // creates 1 request
        notificationType: CheckNotificationType.checkInvalid,
        checkCode: 'code',
        version: 1
      },
      { // creates 1 request
        notificationType: CheckNotificationType.checkReceived,
        checkCode: 'code',
        version: 1
      }
    ])
    expect(createdRequests).toBeDefined()
    expect(createdRequests.length).toBe(4)
  })

})
