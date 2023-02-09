import { IPrepareAnswersAndInputsDataService, PrepareAnswersAndInputsDataService } from './prepare-answers-and-inputs.data.service'
import { mockCompletionCheckMessage } from './mocks/completed-check.message'
import { IQuestionService, QuestionService } from './question.service'
import { IUserInputService, UserInputService } from './user-input.service'
import { ISqlService, ITransactionRequest } from '../../sql/sql.service'
import { Answer, DBQuestion, Input, MarkedAnswer, ValidatedCheck } from './models'

const mockQuestion: DBQuestion = {
  id: 1,
  factor1: 1,
  factor2: 1,
  isWarmup: false,
  code: 'Q001'
}

let sut: ITestPrepareAnswersAndInputsDataService
let questionService: IQuestionService
let userInputService: IUserInputService
let mockSqlService: ISqlService

interface ITestPrepareAnswersAndInputsDataService extends IPrepareAnswersAndInputsDataService {
  questionWasAnsweredMoreThanOnce (answers: Answer[], markedAnswer: MarkedAnswer): boolean
  prepareInputs (rawInputs: Input[], question: DBQuestion, sqlAnswerVar: string): Promise<ITransactionRequest>
}

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
    sut = new PrepareAnswersAndInputsDataService(questionService, userInputService) as unknown as ITestPrepareAnswersAndInputsDataService
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
    const matches = res[0].sql.match(/INSERT INTO mtc_results\.\[answer\]/g)
    expect(matches).toHaveLength(10)
  })

  test('it finds the inputs that make up each answer and creates sql statements for each answer', async () => {
    jest.spyOn(questionService, 'findQuestion').mockResolvedValue(mockQuestion)
    const prepareInputSpy = jest.spyOn(sut as any, 'prepareInputs')
    await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, mockCompletionCheckMessage.validatedCheck)
    expect(prepareInputSpy).toHaveBeenCalledTimes(10)
  })

  test('it can detect when a question was answered more than once', async () => {
    const spy = jest.spyOn(sut, 'questionWasAnsweredMoreThanOnce')
    jest.spyOn(questionService, 'findQuestion').mockResolvedValue(mockQuestion)
    const validatedCheck: ValidatedCheck = JSON.parse(JSON.stringify(mockCompletionCheckMessage.validatedCheck))
    // Add a second answered question to the validated check structure
    validatedCheck.answers.push({
      factor1: 6,
      factor2: 5,
      answer: '99',
      sequenceNumber: 9,
      question: '6x5',
      clientTimestamp: '2020-09-29T12:26:36.345Z'
    })
    await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, validatedCheck)

    // We expect the 9th question to have been asked more than once (as there is a second entry in validatedCheck.answers). There
    // isn't a corresponding second entry in markedCheck.answers because it only marks the first question.
    expect(spy.mock.calls[8][1].sequenceNumber).toBe(9) // check we have the 9th answer in the index 8
    expect(spy.mock.results[8].value).toBe(true)

    // All the other questions should not have been duplicates
    expect(spy.mock.results[0].value).toBe(false)
    expect(spy.mock.results[1].value).toBe(false)
    expect(spy.mock.results[2].value).toBe(false)
    expect(spy.mock.results[3].value).toBe(false)
    expect(spy.mock.results[4].value).toBe(false)
    expect(spy.mock.results[5].value).toBe(false)
    expect(spy.mock.results[6].value).toBe(false)
    expect(spy.mock.results[7].value).toBe(false)
    expect(spy.mock.results[9].value).toBe(false)
  })

  test('it removes inputs from duplicate answers, so that only the input from the marked answer is used', async () => {
    jest.spyOn(questionService, 'findQuestion').mockResolvedValue(mockQuestion)
    const prepareInputsSpy = jest.spyOn(sut, 'prepareInputs')
    const validatedCheck: ValidatedCheck = JSON.parse(JSON.stringify(mockCompletionCheckMessage.validatedCheck))
    // Add a second answered question to the validated check structure
    validatedCheck.answers.push({
      factor1: 6,
      factor2: 5,
      answer: '99',
      sequenceNumber: 9,
      question: '6x5',
      clientTimestamp: '2020-09-29T12:26:36.345Z'
    })
    // Add the inputs for the duplicate answer. The first question was already answered at 2020-09-29T12:26:27
    validatedCheck.inputs.push({
      input: '9',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:36.300Z',
      question: '6x5',
      sequenceNumber: 9
    })
    validatedCheck.inputs.push({
      input: '9',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:36.310Z',
      question: '6x5',
      sequenceNumber: 9
    })
    validatedCheck.inputs.push({
      input: 'Enter',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:36.344Z',
      question: '6x5',
      sequenceNumber: 9
    })
    // Add events for the duplicate answer
    validatedCheck.audit.push(
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:30.000Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:30.000Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:33.000Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:36.344Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:36.345Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      }
    )

    await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, validatedCheck)
    // We expect only the first inputs, and those we added in above.
    expect(prepareInputsSpy.mock.calls[8][0]).toStrictEqual([{
      input: '3',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:27.414Z',
      question: '6x5',
      sequenceNumber: 9
    },
    {
      input: '0',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:27.591Z',
      question: '6x5',
      sequenceNumber: 9
    },
    {
      input: 'Enter',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:27.819Z',
      question: '6x5',
      sequenceNumber: 9
    }])
  })

  test('it removes inputs from duplicate answers when the first answer has no inputs (left blank)', async () => {
    jest.spyOn(questionService, 'findQuestion').mockResolvedValue(mockQuestion)
    const prepareInputsSpy = jest.spyOn(sut, 'prepareInputs')
    const validatedCheck: ValidatedCheck = JSON.parse(JSON.stringify(mockCompletionCheckMessage.validatedCheck))
    validatedCheck.answers.forEach(ans => {
      if (ans.sequenceNumber === 9) {
        ans.answer = '' // blank answer for Q9
      }
    })
    // We need to remove all inputs from the validatedCheck for our blank answer
    validatedCheck.inputs = validatedCheck.inputs.filter(inp => inp.sequenceNumber !== 9)
    // Add a second attempt at Q9 to the end of the questions
    validatedCheck.answers.push({
      factor1: 6,
      factor2: 5,
      answer: '99',
      sequenceNumber: 9,
      question: '6x5',
      clientTimestamp: '2020-09-29T12:26:36.345Z'
    })
    // Add the inputs for the duplicate answer. The first question was already answered at 2020-09-29T12:26:27
    validatedCheck.inputs.push({
      input: '9',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:36.300Z',
      question: '6x5',
      sequenceNumber: 9
    })
    validatedCheck.inputs.push({
      input: '9',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:36.310Z',
      question: '6x5',
      sequenceNumber: 9
    })
    validatedCheck.inputs.push({
      input: 'Enter',
      eventType: 'keydown',
      clientTimestamp: '2020-09-29T12:26:36.344Z',
      question: '6x5',
      sequenceNumber: 9
    })
    // Add events for the duplicate answer
    validatedCheck.audit.push(
      {
        type: 'PauseRendered',
        clientTimestamp: '2020-09-29T12:26:30.000Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2020-09-29T12:26:30.000Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2020-09-29T12:26:33.000Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2020-09-29T12:26:36.344Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      },
      {
        type: 'QuestionAnswered',
        clientTimestamp: '2020-09-29T12:26:36.345Z',
        data: {
          sequenceNumber: 9,
          question: '6x5'
        }
      }
    )
    await sut.prepareAnswersAndInputs(mockCompletionCheckMessage.markedCheck, validatedCheck)
    // There should not be any inputs for Q9
    expect(prepareInputsSpy.mock.calls[8][0]).toStrictEqual([])
  })
})
