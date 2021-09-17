import { getSubmittedCheck, SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckConfigValidator } from './check-config.validator'
import { ICheckValidationError } from './validator-types'

let sut: CheckConfigValidator

describe('check-config.validator', () => {
  beforeEach(() => {
    sut = new CheckConfigValidator()
  })

  test('if config property undefined, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.config
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('config property missing')
  })

  test('if config property not an object, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.config = ''
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('config property is not an object')
  })

  test('if config property present, validation passes', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    const error = sut.validate(check)
    expect(error).not.toBeDefined()
  })
})
