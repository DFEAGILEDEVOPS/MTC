import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'
const { isObj } = require('ramda-adjunct')

export class PupilValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.pupil === undefined) {
      return {
        message: 'pupil property missing'
      }
    }
    if (isObj(check.pupil) === false) {
      return {
        message: 'pupil property is not an object'
      }
    }
  }
}
