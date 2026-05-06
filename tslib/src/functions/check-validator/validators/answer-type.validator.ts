import { type ISubmittedCheckValidator, type CheckValidationResult } from './validator-types'

export class AnswerTypeValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.answers === undefined) {
      return {
        message: 'answers property missing'
      }
    }
    for (const answerEntry of check.answers) {
      if (typeof answerEntry.answer !== 'string') {
        return {
          message: `answer ${answerEntry.sequenceNumber} is not of required type (string)`
        }
      }
    }
  }
}
