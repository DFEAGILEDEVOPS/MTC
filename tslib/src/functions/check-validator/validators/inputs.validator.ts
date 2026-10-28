import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types.js'

export class InputsValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.inputs === undefined) {
      return {
        message: 'inputs property missing'
      }
    }
    if (!Array.isArray(check.inputs)) {
      return {
        message: 'inputs property is not an array'
      }
    }
  }
}
