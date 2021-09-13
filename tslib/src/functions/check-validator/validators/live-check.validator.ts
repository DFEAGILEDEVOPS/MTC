import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { ISubmittedCheckValidator, CheckValidationResult } from './breakup'


export class LiveCheckValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.config.practice) {
      return {
        message: 'only live checks can be submitted'
      }
    }
  }
}
