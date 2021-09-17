import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class AnswersPropertyValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
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
