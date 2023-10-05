import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'

export class AnswersValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.answers === undefined) {
      return {
        message: 'answers property missing'
      }
    }
    if (!Array.isArray(check.answers)) {
      return {
        message: 'answers property is not an array'
      }
    }
  }
}
