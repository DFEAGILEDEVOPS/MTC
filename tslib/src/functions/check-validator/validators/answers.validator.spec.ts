import { AnswersValidator } from './answers.validator'
import { type ICheckValidationError } from './validator-types'

let sut: AnswersValidator

describe('answers-property.validator', () => {
  beforeEach(() => {
    sut = new AnswersValidator()
  })

  test('if answers property undefined, validation fails', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('answers property missing')
  })

  test('if answers property not an array, validation fails', () => {
    const check = {
      answers: {}
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('answers property is not an array')
  })
})
