import { isObj } from 'ramda-adjunct'
import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'

export class PupilValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.pupil === undefined) {
      return {
        message: 'pupil property missing'
      }
    }
    if (!isObj(check.pupil)) {
      return {
        message: 'pupil property is not an object'
      }
    }
  }
}
