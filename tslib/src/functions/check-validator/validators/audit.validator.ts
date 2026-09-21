import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types.js'

export class AuditValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
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
