import { isObj } from 'ramda-adjunct'
import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { CheckValidationResult, ISubmittedCheckValidator } from './validator-types'

export class TokensValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.tokens === undefined) {
      return {
        message: 'tokens property missing'
      }
    }
    if (!isObj(check.tokens)) {
      return {
        message: 'tokens property is not an object'
      }
    }
  }
}
