import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { InputsValidator } from './inputs.validator'
import { ICheckValidationError } from './validator-types'

let sut: InputsValidator

describe('inputs-property.validator', () => {
  beforeEach(() => {
    sut = new InputsValidator()
  })

  test('if inputs property undefined, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.inputs
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('inputs property missing')
  })

  test('if inputs property not an array, validation fails', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    check.inputs = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('inputs property is not an array')
  })
})
