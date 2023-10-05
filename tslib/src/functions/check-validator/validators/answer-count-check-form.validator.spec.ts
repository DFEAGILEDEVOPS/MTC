import { AnswerCountCheckFormValidator } from './answer-count-check-form.validator'
import { type ICheckValidationError } from './validator-types'
import { type ICheckFormService } from '../../../services/check-form.service'

let sut: AnswerCountCheckFormValidator

const checkForm = [
  { f1: 2, f2: 2 },
  { f1: 3, f2: 2 },
  { f1: 4, f2: 2 },
  { f1: 5, f2: 2 },
  { f1: 6, f2: 2 }
]

const CheckFormServiceMock = jest.fn<ICheckFormService, any>(() => ({
  getCheckFormForCheckCode: jest.fn(),
  getCheckFormDataByCheckCode: jest.fn()
}))

describe('answer-count.validator', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    const checkFormServiceMock = new CheckFormServiceMock()
    jest.spyOn(checkFormServiceMock, 'getCheckFormForCheckCode').mockResolvedValue(checkForm)
    sut = new AnswerCountCheckFormValidator(checkFormServiceMock)
  })

  test('minimum number of answers passes validation', async () => {
    const expectedQuestionCount = checkForm.length
    const check = {
      answers: [] as any,
      checkCode: '0000-0000-0000-000000'
    }
    for (let index = 1; index < expectedQuestionCount + 1; index++) { // 1 answer for each question
      const d = new Date()
      check.answers.push({
        answer: index,
        clientTimestamp: (new Date()).toUTCString(),
        factor1: index + 1,
        factor2: 2,
        question: `${index + 1}x2`,
        sequenceNumber: index,
        monotonicTime: {
          sequenceNumber: index + 1,
          legacyDate: d.toUTCString(),
          milliseconds: d.valueOf() + 0.4
        }
      })
    }
    const error = await sut.validate(check)
    expect(error).toBeUndefined()
  })

  test('more answers than expected passes validation', async () => {
    const expectedQuestionCount = checkForm.length
    const check = {
      answers: [] as any,
      checkCode: '0000-0000-0000-000000'
    }
    for (let index = 1; index < expectedQuestionCount + 2; index++) { // 1 answer for each question + 1 extra
      check.answers.push({
        answer: index,
        clientTimestamp: (new Date()).toUTCString(),
        factor1: index + 1,
        factor2: 2,
        question: `${index + 1}x2`,
        sequenceNumber: index
      })
    }
    const error = await sut.validate(check)
    expect(error).toBeUndefined()
  })

  test('less answers fails validation', async () => {
    const expectedQuestionCount = checkForm.length
    const check = {
      answers: [] as any,
      checkCode: '0000-0000-0000-000000'
    }
    for (let index = 1; index < expectedQuestionCount; index++) { // omits final question
      check.answers.push({
        answer: index,
        clientTimestamp: (new Date()).toUTCString(),
        factor1: index + 1,
        factor2: 2,
        question: `${index + 1}x2`,
        sequenceNumber: index
      })
    }
    const error = await sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message)
      .toBe(`submitted check has ${expectedQuestionCount - 1} answers. ${expectedQuestionCount} answers are required`)
  })

  test('less real answers fails validation', async () => {
    const check = {
      answers: [] as any,
      checkCode: '0000-0000-0000-000000'
    }
    for (let index = 1; index < 4; index++) { // Q1-3 answered
      check.answers.push({
        answer: index,
        clientTimestamp: (new Date()).toUTCString(),
        factor1: index + 1,
        factor2: 2,
        question: `${index + 1}x2`,
        sequenceNumber: index
      })
    }
    for (let index = 4; index < 4; index++) { // Q4-7 local storage corruption
      check.answers.push({
        answer: index,
        clientTimestamp: (new Date()).toUTCString(),
        factor1: index + 1,
        factor2: 13, // wrong form
        question: `${index + 1}x2`,
        sequenceNumber: index
      })
    }
    const error = await sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message)
      .toBe(`submitted check has 3 answers. ${checkForm.length} answers are required`)
  })
})
