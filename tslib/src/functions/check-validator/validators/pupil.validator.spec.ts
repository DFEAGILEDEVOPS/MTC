import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { PupilValidator } from './pupil.validator'
import { ICheckValidationError } from './validator-types'

let sut: PupilValidator

describe('pupil-property.validator', () => {
  beforeEach(() => {
    sut = new PupilValidator()
  })

  test('if pupil property undefined, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.pupil
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('pupil property missing')
  })

  test('if pupil property not an object, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.pupil = ''
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('pupil property is not an object')
  })

  test('if pupil property is an object, validation passes', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    const error = sut.validate(check)
    expect(error).not.toBeDefined()
  })
})
