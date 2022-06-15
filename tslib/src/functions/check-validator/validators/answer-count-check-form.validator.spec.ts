import { AnswerCountCheckFormValidator } from './answer-count-check-form.validator'
import { ICheckValidationError } from './validator-types'
import { CheckFormService } from '../../../services/check-form.service'
jest.mock('../../../services/check-form.service') // CheckFormService is now mocked

let sut: AnswerCountCheckFormValidator

const checkForm = [
  { f1: 2, f2: 2 },
  { f1: 3, f2: 2 },
  { f1: 4, f2: 2 },
  { f1: 5, f2: 2 },
  { f1: 6, f2: 2 }
]

describe('answer-count.validator', () => {
  beforeEach(() => {
    const checkFormServiceMock = new CheckFormService()
    jest.spyOn(checkFormServiceMock, 'getCheckFormForCheckCode').mockResolvedValue(checkForm)
    sut = new AnswerCountCheckFormValidator(checkFormServiceMock)
  })

  test('returns an error if the answers property is missing', async () => {
    const check = {
      checkCode: '0000-0000-0000-000000'
    }
    const error = await sut.validate(check)
    expect(error?.message).toBe('no answers property found')
  })

  test('returns an error if the answers property is null', async () => {
    const check = {
      checkCode: '0000-0000-0000-000000',
      answers: null
    }
    const error = await sut.validate(check)
    expect(error?.message).toBe('no answers property found')
  })

  test('returns an error if the answers property is not an array', async () => {
    const check = {
      checkCode: '0000-0000-0000-000000',
      answers: {}
    }
    const error = await sut.validate(check)
    expect(error?.message).toBe('no answers property found')
  })

  test('returns an error if the checkCode property is missing', async () => {
    const check = { answers: [] }
    const error = await sut.validate(check)
    expect(error?.message).toBe('checkCode is missing')
  })

  test('minimim number of answers passes validation', async () => {
    const expectedQuestionCount = checkForm.length
    const check = {
      answers: [] as any,
      checkCode: '0000-0000-0000-000000'
    }
    for (let index = 1; index < expectedQuestionCount + 1; index++) { // 1 answer for each question
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

  test('more answers than exptected passes validation', async () => {
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
    expect((error as ICheckValidationError).message).toBe(`submitted check has ${expectedQuestionCount - 1} answers`)
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
    expect((error as ICheckValidationError).message).toBe('submitted check has 3 answers')
  })
})
