import config from '../../../config'
import { type ISubmittedCheckValidator, type CheckValidationResult } from './validator-types'

export class AnswerCountValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.answers === undefined || check.answers === null) {
      return {
        message: 'no answers property found'
      }
    }
    if (!Array.isArray(check.answers)) {
      // The test can only run if we have the correct data-type so just bail out here.
      // There is another test that reports if the `answers` are not an Array, so no
      // need to duplicate it.
      return
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
        message: `submitted check has ${answerCount} answers. ${config.LiveFormQuestionCount} answers are required}`
      }
    }
  }
}
