
export interface ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult
}

/* eslint-disable  @typescript-eslint/no-invalid-void-type */
export type CheckValidationResult = (ICheckValidationError | void)

export interface ICheckValidationError {
  message: string
}
