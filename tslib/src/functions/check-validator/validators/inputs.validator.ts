import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class InputsValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
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
