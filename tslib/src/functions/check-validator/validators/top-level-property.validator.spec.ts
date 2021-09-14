import { TopLevelPropertyValidator } from './top-level-property.validator'
import { SubmittedCheck, getSubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { ICheckValidationError } from './breakup'

let sut: TopLevelPropertyValidator

describe('top-level-property.validator', () => {
  beforeEach(() => {
    sut = new TopLevelPropertyValidator()
  })

  test('returns validation error when answers property is missing', () => {
    const check: SubmittedCheck = getSubmittedCheck()
    delete check.answers
    const error = sut.validate(check)
    expect(error).toBeDefined()
    expect((error as ICheckValidationError).message).toBe('submitted check is missing the following properties: answers')
  })

  test.todo('passes when all present')
})
