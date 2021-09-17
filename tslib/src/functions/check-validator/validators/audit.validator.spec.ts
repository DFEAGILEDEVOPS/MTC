import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { AuditPropertyValidator } from './audit.validator'
import { ICheckValidationError } from './validator-types'

let sut: AuditPropertyValidator

describe('audit-property.validator', () => {
  beforeEach(() => {
    sut = new AuditPropertyValidator()
  })

  test('if audit property undefined, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.audit
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('audit property missing')
  })

  test('if audit property not an array, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.audit = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('audit property is not an array')
  })
})
