import { SchoolValidator } from './school.validator'
import { type ICheckValidationError } from './validator-types'

let sut: SchoolValidator

describe('school-property.validator', () => {
  beforeEach(() => {
    sut = new SchoolValidator()
  })

  test('if school property undefined, validation fails', () => {
    const check = {}
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('school property missing')
  })

  test('if school property not an object, validation fails', () => {
    const check = {
      school: ''
    }
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('school property is not an object')
  })

  test('if school property is an object, validation passes', () => {
    const check = {
      school: {}
    }
    const error = sut.validate(check)
    expect(error).toBeUndefined()
  })
})
