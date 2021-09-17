import { isObj } from 'ramda-adjunct'
import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class PupilValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
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
