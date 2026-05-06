import * as R from 'ramda'
import { type Answer } from '../../check-marker/models' // pulling in from a different service
import { type IAsyncSubmittedCheckValidator, type CheckValidationResult } from './validator-types'
import { CheckFormService, type ICheckFormService } from '../../../services/check-form.service'

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
        if (a?.monotonicTime?.sequenceNumber !== undefined && b?.monotonicTime?.sequenceNumber !== undefined) {
          return a?.monotonicTime?.sequenceNumber - b?.monotonicTime?.sequenceNumber
        } else {
          return 0
        }
      }
      return 1
    }
    // Return a new array, no mutation
    return R.sort(cmp, answers)
  }

  async validate (check: any): Promise<CheckValidationResult> {
    const answers = check?.answers
    const checkCode = check?.checkCode
    const checkForm = await this.checkFormService.getCheckFormForCheckCode(checkCode)

    if (checkForm === undefined) {
      return {
        message: `check form not found for checkCode ${checkCode}`
      }
    }

    // sort the received answers by timestamp, so we easily find the FIRST answer provided (in the scenario
    // where multiple answers may be received.)
    const sortedAnswers: Answer[] = this.answerSort(answers)

    // there should be an answer for every item in the checkForm
    // Initialise an array of 25 items to 0
    const foundAnswers = Array(this.checkFormService.getLiveFormQuestionCount()).fill(0)

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
        message: `submitted check has ${answerCount} answers. ${checkForm.length} answers are required`
      }
    }
  }
}
