import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types.js'
import * as RA from 'ramda-adjunct'

export class CheckConfigValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.config === undefined) {
      return {
        message: 'config property missing'
      }
    }
    if (RA.isArray(check.config) === true) {
      return {
        message: 'config property is not an object'
      }
    }
    if (RA.isObj(check.config) === false) {
      return {
        message: 'config property is not an object'
      }
    }
  }
}
