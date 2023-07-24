import { isArray, isObj } from 'ramda-adjunct'
import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'

export class CheckConfigValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.config === undefined) {
      return {
        message: 'config property missing'
      }
    }
    if (isArray(check.config)) {
      return {
        message: 'config property is not an object'
      }
    }
    if (!isObj(check.config)) {
      return {
        message: 'config property is not an object'
      }
    }
  }
}
