import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { ISubmittedCheckValidator, CheckValidationResult } from './validator-types'

export class LiveCheckValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.config.practice !== false) {
      return {
        message: 'only live checks can be submitted'
      }
    }
  }
}
