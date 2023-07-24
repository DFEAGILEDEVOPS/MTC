import { isObj } from 'ramda-adjunct'
import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'

export class SchoolValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.school === undefined) {
      return {
        message: 'school property missing'
      }
    }
    if (!isObj(check.school)) {
      return {
        message: 'school property is not an object'
      }
    }
  }
}
