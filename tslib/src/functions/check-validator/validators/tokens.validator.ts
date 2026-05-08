import { type CheckValidationResult, type ISubmittedCheckValidator } from './validator-types'
const { isObj } = require('ramda-adjunct')

export class TokensValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.tokens === undefined) {
      return {
        message: 'tokens property missing'
      }
    }
    if (isObj(check.tokens) === false) {
      return {
        message: 'tokens property is not an object'
      }
    }
  }
}
