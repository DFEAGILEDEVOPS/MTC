import { isObj } from 'ramda-adjunct'
import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'

export class TokensValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
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
