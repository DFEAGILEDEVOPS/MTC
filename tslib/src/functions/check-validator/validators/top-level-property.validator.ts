import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'
import * as RA from 'ramda-adjunct'
import { ISubmittedCheckValidator, CheckValidationResult } from './breakup'


export class TopLevelPropertyValidator implements ISubmittedCheckValidator {
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
  ];

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
