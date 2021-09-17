import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { SchoolValidator } from './school.validator'
import { ICheckValidationError } from './validator-types'

let sut: SchoolValidator

describe('school-property.validator', () => {
  beforeEach(() => {
    sut = new SchoolValidator()
  })

  test('if school property undefined, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.school
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('school property missing')
  })

  test('if school property not an object, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.school = ''
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('school property is not an object')
  })

  test('if school property is an object, validation passes', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    const error = sut.validate(check)
    expect(error).not.toBeDefined()
  })
})
