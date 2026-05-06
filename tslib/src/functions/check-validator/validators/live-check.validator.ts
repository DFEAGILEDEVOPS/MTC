import { type ISubmittedCheckValidator, type CheckValidationResult } from './validator-types'

export class LiveCheckValidator implements ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult {
    if (check.config.practice !== false) {
      return {
        message: `only live checks can be submitted. value:${check.config?.practice}`
      }
    }
  }
}
