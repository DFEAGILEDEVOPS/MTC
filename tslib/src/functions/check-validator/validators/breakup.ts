import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'

export interface ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult
}

export type CheckValidationResult = (ICheckValidationError | void)

export interface ICheckValidationError {
  message: string
}


