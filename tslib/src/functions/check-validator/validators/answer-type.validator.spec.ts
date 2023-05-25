import { AnswerTypeValidator } from './answer-type.validator'
import { type ICheckValidationError } from './validator-types'

let sut: AnswerTypeValidator

describe('answer-type.validator', () => {
  beforeEach(() => {
    sut = new AnswerTypeValidator()
  })

  test('if no answers property, validation fails', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('answers property missing')
  })

  test('if first answer is not a string, validation fails', () => {
    const check = {
      answers: [] as any
    }
    check.answers.push({
      answer: 1,
      clientTimestamp: '',
      factor1: 1,
      factor2: 1,
      question: '1x1',
      sequenceNumber: 1
    })
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('answer 1 is not of required type (string)')
  })

  test('if any answer within set is a number, validation fails', () => {
    const check = {
      answers: [] as any
    }
    check.answers.push({
      answer: '1',
      clientTimestamp: '',
      factor1: 1,
      factor2: 1,
      question: '1x1',
      sequenceNumber: 1
    })
    check.answers.push({
      answer: 2,
      clientTimestamp: '',
      factor1: 2,
      factor2: 2,
      question: '2x2',
      sequenceNumber: 2
    })
    check.answers.push({
      answer: '3',
      clientTimestamp: '',
      factor1: 3,
      factor2: 3,
      question: '3x3',
      sequenceNumber: 3
    })
    check.answers.push({
      answer: '4',
      clientTimestamp: '',
      factor1: 4,
      factor2: 4,
      question: '4x4',
      sequenceNumber: 3
    })
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('answer 2 is not of required type (string)')
  })

  test('if last answer is not a string, validation fails', () => {
    const check = {
      answers: [] as any
    }
    check.answers.push({
      answer: '1',
      clientTimestamp: '',
      factor1: 1,
      factor2: 1,
      question: '1x1',
      sequenceNumber: 1
    })
    check.answers.push({
      answer: '2',
      clientTimestamp: '',
      factor1: 2,
      factor2: 2,
      question: '2x2',
      sequenceNumber: 2
    })
    check.answers.push({
      answer: '3',
      clientTimestamp: '',
      factor1: 3,
      factor2: 3,
      question: '3x3',
      sequenceNumber: 3
    })
    check.answers.push({
      answer: 4,
      clientTimestamp: '',
      factor1: 4,
      factor2: 4,
      question: '4x4',
      sequenceNumber: 4
    })
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('answer 4 is not of required type (string)')
  })

  test('if any answer within set is undefined, validation fails', () => {
    const check = {
      answers: [] as any
    }
    check.answers.push({
      answer: '1',
      clientTimestamp: '',
      factor1: 1,
      factor2: 1,
      question: '1x1',
      sequenceNumber: 1
    })
    check.answers.push({
      answer: undefined,
      clientTimestamp: '',
      factor1: 2,
      factor2: 2,
      question: '2x2',
      sequenceNumber: 2
    })
    check.answers.push({
      answer: '3',
      clientTimestamp: '',
      factor1: 3,
      factor2: 3,
      question: '3x3',
      sequenceNumber: 3
    })
    check.answers.push({
      answer: '4',
      clientTimestamp: '',
      factor1: 4,
      factor2: 4,
      question: '4x4',
      sequenceNumber: 3
    })
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('answer 2 is not of required type (string)')
  })

  test('if answers are all strings, validation passes', () => {
    const check = {
      answers: [] as any
    }
    check.answers.push({
      answer: '1',
      clientTimestamp: '',
      factor1: 1,
      factor2: 1,
      question: '1x1',
      sequenceNumber: 1
    })
    check.answers.push({
      answer: '4',
      clientTimestamp: '',
      factor1: 2,
      factor2: 2,
      question: '2x2',
      sequenceNumber: 2
    })
    check.answers.push({
      answer: '3',
      clientTimestamp: '',
      factor1: 3,
      factor2: 3,
      question: '3x3',
      sequenceNumber: 3
    })
    check.answers.push({
      answer: '4',
      clientTimestamp: '',
      factor1: 4,
      factor2: 4,
      question: '4x4',
      sequenceNumber: 3
    })
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })
})
