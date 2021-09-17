import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { QuestionsPropertyValidator } from './questions.validator'
import { ICheckValidationError } from './validator-types'

let sut: QuestionsPropertyValidator

describe('questions-property.validator', () => {
  beforeEach(() => {
    sut = new QuestionsPropertyValidator()
  })

  test('if questions property undefined, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.questions
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('questions property missing')
  })

  test('if questions property not an array, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.questions = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('questions property is not an array')
  })
})
