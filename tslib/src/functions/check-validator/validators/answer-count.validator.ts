import { ISubmittedCheckValidator, CheckValidationResult } from './validator-types'

export class AnswerCountValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.answers === undefined) {
      return {
        message: 'no answers property found'
      }
    }
    if (check.answers.length < 25) {
      return {
        message: `submitted check has ${check.answers.length} answers`
      }
    }
  }
}
