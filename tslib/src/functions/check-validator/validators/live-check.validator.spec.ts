import { type ICheckValidationError } from './validator-types'
import { LiveCheckValidator } from './live-check.validator'

let sut: LiveCheckValidator

describe('live-check.validator', () => {
  beforeEach(() => {
    sut = new LiveCheckValidator()
  })

  test('should return validation error when practice check', () => {
    const check = {
      config: {
        practice: true
      }
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('only live checks can be submitted. value:true')
  })

  test('should return undefined when live check', () => {
    const check = {
      config: {
        practice: false
      }
    }
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })
})
