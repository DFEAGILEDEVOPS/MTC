import { IPrepareAnswersAndInputsDataService, PrepareAnswersAndInputsDataService } from './prepare-answers-and-inputs.data.service'
import { mockCompletionCheckMessage } from './mocks/completed-check.message'
import { IQuestionService, QuestionService } from './question.service'
import { IUserInputService, UserInputService } from './user-input.service'
import { ISqlService } from '../../sql/sql.service'
import { DBQuestion } from './models'

const mockQuestion: DBQuestion = {
  id: 1,
  factor1: 1,
  factor2: 1,
  isWarmup: false,
  code: 'Q001'
}

let sut: IPrepareAnswersAndInputsDataService
let questionService: IQuestionService
let userInputService: IUserInputService
let mockSqlService: ISqlService

describe('PrepareAnswersAndInputsDataService', () => {
  beforeEach(() => {
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    questionService = new QuestionService(mockSqlService)
    jest.spyOn(questionService as any, 'sqlGetQuestionData').mockResolvedValueOnce([mockQuestion])
    userInputService = new UserInputService(mockSqlService)
    jest.spyOn((userInputService as any), 'sqlGetUserInputLookupData').mockResolvedValue([
      { id: 1, name: 'Mouse', code: 'M' },
      { id: 2, name: 'Keyboard', code: 'K' },
      { id: 3, name: 'Touch', code: 'T' },
      { id: 4, name: 'Pen', code: 'P' },
      { id: 5, name: 'Unknown', code: 'X' }
    ])
    sut = new PrepareAnswersAndInputsDataService(questionService, userInputService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it looks up the question for each markedAnswer', async () => {
    jest.spyOn(questionService, 'findQuestion').mockResolvedValue(mockQuestion)
    await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, mockCompletionCheckMessage.validatedCheck)
    expect(questionService.findQuestion as jest.Mock).toHaveBeenCalledTimes(10)
  })

  test('it throws an error when it cannot find the question', async () => {
    jest.spyOn(questionService, 'findQuestion').mockRejectedValue(new Error('mock error'))
    const f = async (): Promise<void> => { await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, mockCompletionCheckMessage.validatedCheck) }
    await expect(f()).rejects.toThrow(/^Unable to find valid question for/)
  })

  test('it produces an insert statement for each marked answer', async () => {
    jest.spyOn(questionService, 'findQuestion').mockResolvedValue(mockQuestion)
    const res = await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, mockCompletionCheckMessage.validatedCheck)
    const matches = res.sql.match(/INSERT INTO mtc_results\.\[answer\]/g)
    expect(matches).toHaveLength(10)
  })

  test('it finds the inputs that make up each answer and creates sql statements for each answer', async () => {
    jest.spyOn(questionService, 'findQuestion').mockResolvedValue(mockQuestion)
    const prepareInputSpy = jest.spyOn(sut as any, 'prepareInputs')
    await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, mockCompletionCheckMessage.validatedCheck)
    expect(prepareInputSpy).toHaveBeenCalledTimes(10)
  })
})
