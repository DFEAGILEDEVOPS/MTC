import { AuditValidator } from './audit.validator'
import { type ICheckValidationError } from './validator-types'

let sut: AuditValidator

describe('audit-property.validator', () => {
  beforeEach(() => {
    sut = new AuditValidator()
  })

  test('if audit property undefined, validation fails', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('audit property missing')
  })

  test('if audit property not an array, validation fails', () => {
    const check = {
      audit: {}
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('audit property is not an array')
  })
})
