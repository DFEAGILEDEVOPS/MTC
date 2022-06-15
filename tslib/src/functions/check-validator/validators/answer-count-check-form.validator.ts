import * as R from 'ramda'

import config from '../../../config'
import { Answer } from '../../check-marker/models' // pulling in from a different service
import { IAsyncSubmittedCheckValidator, CheckValidationResult } from './validator-types'
import { CheckFormService, ICheckFormService } from '../../../services/check-form.service'

export class AnswerCountCheckFormValidator implements IAsyncSubmittedCheckValidator {
  private readonly checkFormService: ICheckFormService

  constructor (checkFormService?: ICheckFormService) {
    this.checkFormService = checkFormService ?? new CheckFormService()
  }

  private answerSort (answers: Answer[]): Answer[] {
    const cmp = (a: Answer, b: Answer): number => {
      const aDate = new Date(a.clientTimestamp)
      const bDate = new Date(b.clientTimestamp)
      if (aDate < bDate) {
        return -1
      } else if (aDate.getTime() === bDate.getTime()) {
        return 0
      }
      return 1
    }
    // Return a new array, no mutation
    return R.sort(cmp, answers)
  }

  async validate (check: any): Promise<CheckValidationResult> {
    const answers = check?.answers
    if (answers === null || answers === undefined || !Array.isArray(answers)) {
      return {
        message: 'no answers property found'
      }
    }

    const checkCode = check?.checkCode
    if (checkCode === undefined) {
      return {
        message: 'checkCode is missing'
      }
    }

    const checkForm = await this.checkFormService.getCheckFormForCheckCode(checkCode)
    // sort the received answers by timestamp, so we easily find the FIRST answer provided (in the scenario
    // where multiple answers may be received.)
    const sortedAnswers: Answer[] = this.answerSort(answers)

    // there should be an answer for every item in the checkForm
    // Initialise an array of 25 items to 0
    const foundAnswers = Array(config.LiveFormQuestionCount).fill(0)

    // Loop through each Question (from the db) and check there is an answer
    // There must be answer, even if the question timed out with any input from the pupil.
    checkForm.forEach((checkFormItem, index) => {
      const questionNumber = index + 1
      const answer = sortedAnswers.find(ans => ans.sequenceNumber === questionNumber &&
        ans.factor1 === checkFormItem.f1 &&
        ans.factor2 === checkFormItem.f2)
      if (answer !== undefined) {
        // Set the corresponding 'seen' item in the array to show that this question has been found, index 0 = questionNumber 1
        foundAnswers[index] = 1
      }
    })
    const isOne = (currentValue: number): boolean => currentValue === 1
    const answerCount = foundAnswers.filter(isOne).length

    if (answerCount < checkForm.length) {
      return {
        message: `submitted check has ${answerCount} answers`
      }
    }
  }
}
