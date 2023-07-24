import { TYPES } from 'mssql'
import { SyncResultsService } from './sync-results.service'
import { mockCompletionCheckMessage } from './mocks/completed-check.message'
import { ConsoleLogger } from '../../common/logger'
import { SyncResultsDataService } from './sync-results.data.service'
import { type ISqlService, type ITransactionRequest } from '../../sql/sql.service'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { type IRedisService } from '../../caching/redis-service'
jest.mock('./sync-results.data.service')

const mockQuestionData = new Map()
mockQuestionData.set('1x1', { id: 1, factor1: 1, factor2: 2, isWarmup: false, code: 'Q001' })

describe('SyncResultsService', () => {
  let sut: SyncResultsService
  let mockSyncResultsDataService: SyncResultsDataService
  let sqlServiceMock: ISqlService

  const mockTransaction: ITransactionRequest = {
    sql: 'SELECT * FROM table',
    params: [
      { name: 'test', value: 'test', type: TYPES.NVarChar }
    ]
  }
  let redisServiceMock: IRedisService

  beforeEach(() => {
    sqlServiceMock = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    // @ts-ignore exists for mocking
    SyncResultsDataService.mockClear()
    const logger = new ConsoleLogger()
    mockSyncResultsDataService = new SyncResultsDataService(logger, sqlServiceMock)
    ;(mockSyncResultsDataService.prepareCheckResult as jest.Mock).mockReturnValueOnce(mockTransaction)
    ;(mockSyncResultsDataService.deleteExistingResultIfExists as jest.Mock).mockReturnValueOnce(Promise.resolve())
    ;(mockSyncResultsDataService.prepareAnswersAndInputs as jest.Mock).mockReturnValueOnce([mockTransaction, mockTransaction])
    ;(mockSyncResultsDataService.prepareEvents as jest.Mock).mockReturnValueOnce([mockTransaction, mockTransaction])
    ;(mockSyncResultsDataService.prepareDeviceData as jest.Mock).mockReturnValueOnce(mockTransaction)
    ;(mockSyncResultsDataService.setCheckToResultsSyncComplete as jest.Mock).mockReturnValueOnce(Promise.resolve())
    ;(mockSyncResultsDataService.setCheckToResultsSyncFailed as jest.Mock).mockReturnValueOnce(Promise.resolve())
    redisServiceMock = new RedisServiceMock()
    sut = new SyncResultsService(logger, mockSyncResultsDataService, redisServiceMock)
  })

  test('it makes a call to delete any existing entry from the checkResult table', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(2)
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.deleteExistingResultIfExists).toHaveBeenCalledTimes(1)
  })

  test('it makes a call to prepare the data for the checkResult table', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(2)
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareCheckResult).toHaveBeenCalledTimes(1)
  })

  test('it makes a call to prepare the data for the answers and inputs table', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(2)
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareAnswersAndInputs).toHaveBeenCalledTimes(1)
  })

  test('it makes a call to prepare the data for the userDevice table', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(2)
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareDeviceData).toHaveBeenCalledTimes(1)
  })

  test('it makes a call persist all the prepared data in the database', async () => {
    jest.spyOn(console, 'info').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(2)
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.insertToDatabase).toHaveBeenCalledTimes(1)
  })

  test('the school results cache is dropped when the database is updated', async () => {
    jest.spyOn(console, 'info').mockImplementation(() => {})
    jest.spyOn(sut as any, 'dropRedisSchoolResult').mockResolvedValueOnce(undefined)
    await sut.process(mockCompletionCheckMessage)
    expect((sut as any).dropRedisSchoolResult).toHaveBeenCalledTimes(1)
  })

  test('dropRedisSchoolResult makes a call redisService.drop', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(42)
    await (sut as any).dropRedisSchoolResult('test-uuid')
    expect(redisServiceMock.drop).toHaveBeenCalledTimes(1)
    expect(redisServiceMock.drop).toHaveBeenCalledWith(['result:42'])
  })

  test('dropRedisSchoolResult returns undefined if the sql calls does not find a school', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(undefined)
    await (sut as any).dropRedisSchoolResult('test-uuid')
    expect(redisServiceMock.drop).not.toHaveBeenCalled()
  })

  test('dropRedisSchoolResult returns undefined if the schoolUuid param provided is undefined', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    // jest.spyOn(console, 'info').mockImplementation(() => {})

    const res = await (sut as any).dropRedisSchoolResult(undefined)
    expect(redisServiceMock.drop).not.toHaveBeenCalled()
    expect(res).toBeUndefined()
  })

  test('it makes a call to set the check to sync complete when no errors are thrown', async () => {
    jest.spyOn(console, 'info').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(2)
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.setCheckToResultsSyncComplete).toHaveBeenCalledTimes(1)
  })

  test('it makes a call to set the check to sync failed when an error is thrown', async () => {
    jest.spyOn(console, 'info').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'getSchoolId').mockResolvedValueOnce(2)
    // eslint-disable-next-line
    jest.spyOn(sut['syncResultsDataService'], 'insertToDatabase').mockImplementation(() => { throw new Error('failed') })
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.setCheckToResultsSyncFailed).toHaveBeenCalledTimes(1)
    expect(mockSyncResultsDataService.setCheckToResultsSyncComplete).toHaveBeenCalledTimes(0)
  })
})
