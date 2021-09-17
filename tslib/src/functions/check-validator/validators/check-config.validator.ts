import { isObj } from 'ramda-adjunct'
import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class CheckConfigValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.config === undefined) {
      return {
        message: 'config property missing'
      }
    }
    if (!isObj(check.config)) {
      return {
        message: 'config property is not an object'
      }
    }
  }
}
