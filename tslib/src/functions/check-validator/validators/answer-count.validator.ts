import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { ISubmittedCheckValidator, CheckValidationResult } from './breakup'


export class AnswerCountValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.answers.length < 25) {
      return {
        message: `submitted check has ${check.answers.length} answers.`
      }
    }
  }
}
