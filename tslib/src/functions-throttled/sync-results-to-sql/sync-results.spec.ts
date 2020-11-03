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
    ;(mockSyncResultsDataService.prepareEvents as jest.Mock).mockReturnValueOnce(mockTransaction)
    ;(mockSyncResultsDataService.prepareAnswersAndInputs as jest.Mock).mockReturnValueOnce(mockTransaction)
    sut = new SyncResultsService(logger, mockSyncResultsDataService)
  })

  test('it fetches the questions from the database when first called', async () => {
    (mockSyncResultsDataService.sqlGetQuestionData as jest.Mock).mockReturnValueOnce(Promise.resolve(mockQuestionData))
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.sqlGetQuestionData).toHaveBeenCalledTimes(1)
    if (sut.questionHash === undefined) {
      fail('questionHash should be defined')
    }
    expect(sut.questionHash.size).toBe(1)
  })

  test('it makes a call to prepare the data for the checkResult table', async () => {
    (mockSyncResultsDataService.sqlGetQuestionData as jest.Mock).mockReturnValueOnce(Promise.resolve(mockQuestionData))
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareCheckResult).toHaveBeenCalledTimes(1)
  })

  test('it makes a call to prepare the data for the answers and inputs table', async () => {
    (mockSyncResultsDataService.sqlGetQuestionData as jest.Mock).mockReturnValueOnce(Promise.resolve(mockQuestionData))
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.prepareAnswersAndInputs).toHaveBeenCalledTimes(1)
  })

  test('it makes a call persist all the prepared data in the database', async () => {
    (mockSyncResultsDataService.sqlGetQuestionData as jest.Mock).mockReturnValueOnce(Promise.resolve(mockQuestionData))
    await sut.process(mockCompletionCheckMessage)
    expect(mockSyncResultsDataService.insertToDatabase).toHaveBeenCalledTimes(1)
  })
})
