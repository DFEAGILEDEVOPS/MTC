import { SyncResultsService } from './sync-results.service'
import { mockCompletionCheckMessage } from './mocks/completed-check.message'
import { ConsoleLogger } from '../../common/logger'
import { SyncResultsDataService } from './sync-results.data.service'

const mockQuestionData = new Map()
mockQuestionData.set('1x1', { id: 1, factor1: 1, factor2: 2, isWarmup: false, code: 'Q001' })

const mockSyncResultsDataService = {
  sqlGetQuestionData: async () => { return mockQuestionData }
}

describe('SyncResultsService', () => {
  let sut: SyncResultsService

  beforeEach(() => {
    const logger = new ConsoleLogger()
    sut = new SyncResultsService(logger, mockSyncResultsDataService as SyncResultsDataService)
  })

  test('it fetches the questions from the database when first called', async () => {
    const sqlGetQuestionDataSpy = jest.spyOn(mockSyncResultsDataService, 'sqlGetQuestionData')
    await sut.process(mockCompletionCheckMessage)
    expect(sqlGetQuestionDataSpy).toHaveBeenCalledTimes(0)
    expect(sut.questionHash!.size).toBe(1)
  })
})
