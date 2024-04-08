'use strict'

const { mtcError } = require('./mtc-error')
export const formAlreadySubmittedErrorCode = 'E_FORM_ALREADY_SUBMITTED'

export class FormAlreadySubmittedError extends mtcError {
  constructor () {
    const message = 'Form already submitted'
    super(message)
    this.code = formAlreadySubmittedErrorCode
  }
}
