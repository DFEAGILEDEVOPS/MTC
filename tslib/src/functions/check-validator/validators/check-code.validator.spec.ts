import { CheckCodeValidator } from './check-code.validator'
import { type ICheckValidationError } from './validator-types'

let sut: CheckCodeValidator

describe('check-code.validator', () => {
  beforeEach(() => {
    sut = new CheckCodeValidator()
  })

  test('if check code property undefined, validation fails', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('checkCode property missing')
  })

  test('if checkCode not a UUID, validation fails', () => {
    const check = {
      checkCode: 'foo-bar'
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('checkCode is not a valid UUID')
  })

  test('if checkCode a UUID, validation succeeds', () => {
    const v4UUID = 'e3f818af-adb3-4e9d-ab6d-b6bc7db8c83d'
    const check = {
      checkCode: v4UUID
    }
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })
})
