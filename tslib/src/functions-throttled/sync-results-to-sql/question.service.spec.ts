import { type IQuestionService, QuestionService } from './question.service'
import { type ISqlService } from '../../sql/sql.service'
import { type DBQuestion } from './models'

describe('QuestionService', () => {
  let sut: IQuestionService
  let mockSqlService: ISqlService

  beforeEach(() => {
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new QuestionService(mockSqlService)
    const mockQuestion: DBQuestion = {
      id: 1,
      factor1: 1,
      factor2: 1,
      isWarmup: false,
      code: 'Q001'
    }
    const mockWarmupQuestion: DBQuestion = {
      id: 2,
      factor1: 2,
      factor2: 2,
      isWarmup: true,
      code: 'W002'
    }
    jest.spyOn((sut as any), 'sqlGetQuestionData').mockReturnValue(Promise.resolve([mockQuestion, mockWarmupQuestion]))
  })

  test('it initialises when it is first called', async () => {
    await sut.findQuestion('1x1')
    expect((sut as any).initialised).toBe(true)
  })

  test('it only calls initialise() once', async () => {
    const initSpy = jest.spyOn((sut as any), 'initialise')
    await sut.findQuestion('1x1')
    await sut.findQuestion('1x1')
    expect(initSpy).toHaveBeenCalledTimes(1)
  })

  test('it returns the data for a question that it finds', async () => {
    const dbq = await sut.findQuestion('1x1')
    expect(dbq).toMatchObject({ id: 1, factor1: 1, factor2: 1, code: 'Q001', isWarmup: false })
  })

  test('it throws when given a question that it cannot find', async () => {
    await expect(sut.findQuestion('13x13')).rejects.toThrow(/^Unable to find question/)
  })

  test('it only caches live questions', async () => {
    await expect(sut.findQuestion('2x2')).rejects.toThrow(/^Unable to find question/)
    // the difference between this test and the 13x13 one above is that 2x2 was provided in the database response
  })
})
