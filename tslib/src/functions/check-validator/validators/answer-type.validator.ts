import { type ISubmittedCheckValidator, type CheckValidationResult } from './validator-types'

export class AnswerTypeValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.answers === undefined) {
      return {
        message: 'answers property missing'
      }
    }
    for (let index = 0; index < check.answers.length; index++) {
      const answerEntry = check.answers[index]
      if (typeof answerEntry.answer !== 'string') {
        return {
          message: `answer ${answerEntry.sequenceNumber} is not of required type (string)`
        }
      }
    }
  }
}
