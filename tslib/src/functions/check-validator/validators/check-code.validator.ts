import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types.js'
import { isValidUuid } from '../../../common/uuid.js'

export class CheckCodeValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.checkCode === undefined) {
      return {
        message: 'checkCode property missing'
      }
    }
    if (!isValidUuid(check.checkCode)) {
      return {
        message: 'checkCode is not a valid UUID'
      }
    }
  }
}
