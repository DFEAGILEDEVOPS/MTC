'use strict'
const { FormAlreadySubmittedError } = require('../error-types/form-already-submitted-error')

function preventDuplicateFormSubmission (req, res, next) {
  if (req.method !== 'POST' || (req.body && !req.body._csrf)) {
    req.session.formCsrf = undefined
    return next()
  }

  if (req.method === 'POST' && req.body._csrf) {
    if (req.session.formCsrf === req.body._csrf) {
      next(new FormAlreadySubmittedError('Form already submitted'))
    } else {
      req.session.formCsrf = req.body._csrf
      req.session.save()
    }
  }

  next()
}

module.exports = preventDuplicateFormSubmission
