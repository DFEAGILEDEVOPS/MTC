import { SubmittedCheck } from '../../../schemas/check-schemas/submitted-check'

export interface ISubmittedCheckValidator {
  validate (check: SubmittedCheck): CheckValidationResult
}

/* eslint-disable  @typescript-eslint/no-invalid-void-type */
export type CheckValidationResult = (ICheckValidationError | void)

export interface ICheckValidationError {
  message: string
}
