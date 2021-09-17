import { isObj } from 'ramda-adjunct'
import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class SchoolValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
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
