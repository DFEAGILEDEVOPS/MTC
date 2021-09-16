import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'
import { validate } from 'uuid'

export class CheckCodeValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.checkCode === undefined) {
      return {
        message: 'checkCode property missing'
      }
    }
    if (!validate(check.checkCode)) {
      return {
        message: 'checkCode is not a valid UUID'
      }
    }
  }

}
