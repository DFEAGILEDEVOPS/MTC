import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'
import { validate } from 'uuid'

export class CheckCodeValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
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
