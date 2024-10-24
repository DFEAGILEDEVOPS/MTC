import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'
const { isObj } = require('ramda-adjunct')

export class SchoolValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.school === undefined) {
      return {
        message: 'school property missing'
      }
    }
    if (isObj(check.school) === false) {
      return {
        message: 'school property is not an object'
      }
    }
  }
}
