import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class AuditValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.audit === undefined) {
      return {
        message: 'audit property missing'
      }
    }
    if (!Array.isArray(check.audit)) {
      return {
        message: 'audit property is not an array'
      }
    }
  }
}
