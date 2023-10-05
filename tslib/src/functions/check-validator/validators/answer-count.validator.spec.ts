import { AnswerCountValidator } from './answer-count.validator'
import { type ICheckValidationError } from './validator-types'
import config from '../../../config'

let sut: AnswerCountValidator

describe('answer-count.validator', () => {
  beforeEach(() => {
    sut = new AnswerCountValidator()
  })

  test('less answers fails validation', () => {
    const expectedQuestionCount = config.LiveFormQuestionCount
    const check = {
      answers: [] as any
    }
    for (let index = 1; index < expectedQuestionCount; index++) { // omits final question
      check.answers.push({
        answer: index,
        clientTimestamp: '',
        factor1: 1,
        factor2: 1,
        question: '1x1',
        sequenceNumber: index
      })
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message)
      .toBe(`submitted check has ${expectedQuestionCount - 1} answers. ${expectedQuestionCount} answers are required}`)
  })

  test('no answers property found fails validation', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('no answers property found')
  })

  test('zero answer count fails validation', () => {
    const check = {
      answers: [] as any
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message)
      .toBe(`submitted check has 0 answers. ${config.LiveFormQuestionCount} answers are required}`)
  })

  test('correct answer count passes validation', () => {
    const expectedQuestionCount = config.LiveFormQuestionCount
    const check = {
      answers: [] as any
    }
    for (let index = 0; index < expectedQuestionCount; index++) {
      check.answers.push({
        answer: index,
        clientTimestamp: '',
        factor1: 1,
        factor2: 1,
        question: '1x1',
        sequenceNumber: index + 1
      })
    }
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })

  test('more answers passes validation', () => {
    const expectedQuestionCount = config.LiveFormQuestionCount
    const check = {
      answers: [] as any
    }
    for (let index = 0; index < expectedQuestionCount + 10; index++) {
      check.answers.push({
        answer: index,
        clientTimestamp: '',
        factor1: 1,
        factor2: 1,
        question: '1x1',
        sequenceNumber: index + 1 < expectedQuestionCount ? index + 1 : expectedQuestionCount
      })
    }
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })

  test('more answers but one answer is missing fails validation', () => {
    const expectedQuestionCount = config.LiveFormQuestionCount
    const check = {
      answers: [] as any
    }
    for (let index = 1; index < expectedQuestionCount + 10; index++) { // omit sequenceNumber 1
      check.answers.push({
        answer: index,
        clientTimestamp: '',
        factor1: 1,
        factor2: 1,
        question: '1x1',
        sequenceNumber: index < expectedQuestionCount ? index + 1 : expectedQuestionCount
      })
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
  })
})
