import { AnswerCountValidator } from './answer-count.validator'
import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { ICheckValidationError } from './breakup'

let sut: AnswerCountValidator

describe('answer-count.validator', () => {
  beforeEach(() => {
    sut = new AnswerCountValidator()
  })

  test('less answers', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    for (let index = 0; index < 24; index++) {
      check.answers.push({
        answer: index,
        clientTimestamp: '',
        factor1: 1,
        factor2: 1,
        question: '1x1',
        sequenceNumber: 1
      })
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('submitted check has 24 answers.')
  })

  test('no answers', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('submitted check has 0 answers.')
  })

  test('correct answer count', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    for (let index = 0; index < 25; index++) {
      check.answers.push({
        answer: index,
        clientTimestamp: '',
        factor1: 1,
        factor2: 1,
        question: '1x1',
        sequenceNumber: 1
      })
    }
    const error = sut.validate(check)
    expect(error).not.toBeDefined()
  })
})
