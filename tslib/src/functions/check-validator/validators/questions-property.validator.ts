import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class QuestionsPropertyValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.questions === undefined) {
      return {
        message: 'questions property missing'
      }
    }
    if (!Array.isArray(check.questions)) {
      return {
        message: 'questions property is not an array'
      }
    }
  }
}
