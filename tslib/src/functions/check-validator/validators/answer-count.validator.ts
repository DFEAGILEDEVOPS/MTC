import config from '../../../config'
import { ISubmittedCheckValidator, CheckValidationResult } from './validator-types'

export class AnswerCountValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.answers === undefined) {
      return {
        message: 'no answers property found'
      }
    }
    // there should be an answer for every question
    const foundAnswers = Array(config.LiveFormQuestionCount).fill(0)
    check.answers.forEach((a: { sequenceNumber: number }) => {
      foundAnswers[a.sequenceNumber - 1] = 1
    })
    const isOne = (currentValue: number): boolean => currentValue === 1
    const answerCount = foundAnswers.filter(isOne).length
    if (answerCount < config.LiveFormQuestionCount) {
      return {
        message: `submitted check has ${answerCount} answers`
      }
    }
  }
}
