import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { ICheckValidationError } from './validator-types'
import { LiveCheckValidator } from "./live-check.validator"

let sut: LiveCheckValidator

describe('live-check.validator', () => {
  beforeEach(() => {
    sut = new LiveCheckValidator()
  })

  test('should return validation error when practice check', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.config.practice = true
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('only live checks can be submitted')
  })

  test('should return undefined when live check', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.config.practice = false
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })
})
