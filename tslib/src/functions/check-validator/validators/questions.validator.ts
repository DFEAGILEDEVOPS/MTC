import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'

export class QuestionsValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
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
