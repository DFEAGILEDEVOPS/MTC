import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { TokensValidator } from './tokens.validator'
import { ICheckValidationError } from './validator-types'

let sut: TokensValidator

describe('tokens-property.validator', () => {
  beforeEach(() => {
    sut = new TokensValidator()
  })

  test('if tokens property undefined, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.tokens
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('tokens property missing')
  })

  test('if tokens property not an object, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.tokens = ''
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('tokens property is not an object')
  })

  test('if tokens property is an object, validation passes', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    const error = sut.validate(check)
    expect(error).not.toBeDefined()
  })
})
