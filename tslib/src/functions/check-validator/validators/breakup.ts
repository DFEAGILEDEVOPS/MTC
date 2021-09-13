import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import * as RA from 'ramda-adjunct'

export interface ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult
}

export type CheckValidationResult = (ICheckValidationError | void)

export interface ICheckValidationError {
  message: string
}

export class AnswerTypeValidator implements ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult {
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

export class TopLevelPropertyStructureValidator implements ISubmittedCheckValidator {
  private requiredTopLevelProperties = [
    'answers',
    'audit',
    'checkCode',
    'config',
    'inputs',
    'pupil',
    'questions',
    'school',
    'tokens'
  ]

  validate (check: SubmittedCheck): CheckValidationResult {
    const missingProperties: string[] = []
    for (let index = 0; index < this.requiredTopLevelProperties.length; index++) {
      const propertyName = this.requiredTopLevelProperties[index]
      if (!(propertyName in check)) {
        missingProperties.push(propertyName)
      }
    }
    const missingPropertyNames = missingProperties.join()
    if (!RA.isEmptyArray(missingProperties)) {
      return {
        message: `submitted check is missing the following properties: ${missingPropertyNames}`
      }
    }
  }

}
