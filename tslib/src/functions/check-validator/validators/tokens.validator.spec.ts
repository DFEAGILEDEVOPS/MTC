import { TokensValidator } from './tokens.validator'
import { type ICheckValidationError } from './validator-types'

let sut: TokensValidator

describe('tokens-property.validator', () => {
  beforeEach(() => {
    sut = new TokensValidator()
  })

  test('if tokens property undefined, validation fails', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('tokens property missing')
  })

  test('if tokens property not an object, validation fails', () => {
    const check = {
      tokens: ''
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('tokens property is not an object')
  })

  test('if tokens property is an object, validation passes', () => {
    const check = {
      tokens: {}
    }
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })
})
