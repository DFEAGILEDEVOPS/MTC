import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'
const { isArray, isObj } = require('ramda-adjunct')

export class CheckConfigValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.config === undefined) {
      return {
        message: 'config property missing'
      }
    }
    if (isArray(check.config) === true) {
      return {
        message: 'config property is not an object'
      }
    }
    if (isObj(check.config) === false) {
      return {
        message: 'config property is not an object'
      }
    }
  }
}
