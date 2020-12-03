import { ProcessingFailureService, ICheckResetService } from './processing-failure.service'
import { ISqlService } from '../../sql/sql.service'
import { ILogger, MockLogger } from '../../common/logger'

describe('ProcessingFailureService', () => {
  let sut: ICheckResetService
  let mockLogger: ILogger
  let mockSqlService: ISqlService

  beforeEach(() => {
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    mockLogger = new MockLogger()
    sut = new ProcessingFailureService(mockLogger, mockSqlService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it makes a call to sqlServiceModifyWithTransaction to update the admin schema', async () => {
    await sut.processingFailed('abc')
    expect(mockSqlService.modifyWithTransaction).toHaveBeenCalledTimes(1)
  })
})
