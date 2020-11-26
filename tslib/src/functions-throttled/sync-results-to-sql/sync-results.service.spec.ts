import { TYPES } from 'mssql'
import { SyncResultsService } from './sync-results.service'
import { mockCompletionCheckMessage } from './mocks/completed-check.message'
import { ConsoleLogger } from '../../common/logger'
import { SyncResultsDataService } from './sync-results.data.service'
import { ITransactionRequest } from '../../sql/sql.service'
jest.mock('./sync-results.data.service')

const mockQuestionData = new Map()
mockQuestionData.set('1x1', { id: 1, factor1: 1, factor2: 2, isWarmup: false, code: 'Q001' })

describe('SyncResultsService', () => {
  let sut: SyncResultsService
  let mockSyncResultsDataService: SyncResultsDataService
  const mockTransaction: ITransactionRequest = {
    sql: 'SELECT * FROM table',
    params: [
      { name: 'test', value: 'test', type: TYPES.NVarChar }
    ]
  }

  beforeEach(() => {
    // @ts-ignore exists for mocking
    SyncResultsDataService.mockClear()
    const logger = new ConsoleLogger()
    mockSyncResultsDataService = new SyncResultsDataService()
    ;(mockSyncResultsDataService.prepareCheckResult as jest.Mock).mockReturnValueOnce(mockTransaction)
    ;(mockSyncResultsDataService.prepareAnswersAndInputs as jest.Mock).mockReturnValueOnce(mockTransaction)
    ;(mockSyncResultsDataService.prepareEvents as jest.Mock).mockReturnValueOnce(mockTransaction)
    ;(mockSyncResultsDataService.prepareDeviceData as jest.Mock).mockReturnValueOnce(mockTransaction)
    sut = new SyncResultsService(logger, mockSyncResultsDataService)
  })

  test('it makes a call to prepare the data for the checkResult table', async () => {
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareCheckResult).toHaveBeenCalledTimes(1)
  })

  test('it makes a call to prepare the data for the answers and inputs table', async () => {
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareAnswersAndInputs).toHaveBeenCalledTimes(1)
  })

  test('it makes a call to prepare the data for the userDevice table', async () => {
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareDeviceData).toHaveBeenCalledTimes(1)
  })

  test('it makes a call persist all the prepared data in the database', async () => {
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.insertToDatabase).toHaveBeenCalledTimes(1)
  })

  test('the args to persist the data in the database are reduced', async () => {
    await sut.process(mockCompletionCheckMessage)
    const args = (mockSyncResultsDataService.insertToDatabase as jest.Mock).mock.calls
    const flattenedTransactions = args[0][0]
    expect(args).toHaveLength(1) // there should be only 1 argument to insertToDatabase
    expect(Array.isArray(args)).toBe(true)
    const param = flattenedTransactions[0]
    expect(typeof param).toBe('object')
    expect(param).toHaveProperty('sql')
    expect(param).toHaveProperty('params')
    expect(param.params).toHaveLength(4)
  })
})
