'use strict'

function preventDuplicateFormSubmission (req, res, next) {
  if (req.method !== 'POST' || (req.body && !req.body._csrf)) {
    req.session.formCsrf = undefined
    return next()
  }

  if (req.method === 'POST' && req.body._csrf) {
    if (req.session.formCsrf === req.body._csrf) {
      next(new Error('Form already submitted'))
    } else {
      req.session.formCsrf = req.body._csrf
      req.session.save()
    }
  }

  next()
}

module.exports = preventDuplicateFormSubmission
