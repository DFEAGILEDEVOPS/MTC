'use strict'

const { mtcError } = require('./mtc-error')
const userInitErrorConsts = require('../lib/errors/user')
export const formAlreadySubmittedErrorCode = 'E_FORM_ALREADY_SUBMITTED'

export class FormAlreadySubmittedError extends mtcError {
  constructor () {
    const message = 'Form already submitted'
    super(message)
    this.code = formAlreadySubmittedErrorCode
  }
}
