import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import { ISubmittedCheckValidator, CheckValidationResult } from './validator-types'

export class AnswerTypeValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
    if (check.answers === undefined) {
      return {
        message: 'no answers found'
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
