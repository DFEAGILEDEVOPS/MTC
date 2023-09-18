export interface ISubmittedCheckValidator {
  validate (check: any): CheckValidationResult
}

export interface IAsyncSubmittedCheckValidator {
  validate (check: any): Promise<CheckValidationResult>
}

/* eslint-disable  @typescript-eslint/no-invalid-void-type */
export type CheckValidationResult = (ICheckValidationError | void)

export interface ICheckValidationError {
  message: string
}
