import { QuestionsValidator } from './questions.validator'
import { type ICheckValidationError } from './validator-types'

let sut: QuestionsValidator

describe('questions-property.validator', () => {
  beforeEach(() => {
    sut = new QuestionsValidator()
  })

  test('if questions property undefined, validation fails', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('questions property missing')
  })

  test('if questions property not an array, validation fails', () => {
    const check = {
      questions: {}
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('questions property is not an array')
  })

  test('validation passes when questions is an array', () => {
    const check = {
      questions: []
    }
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })
})
