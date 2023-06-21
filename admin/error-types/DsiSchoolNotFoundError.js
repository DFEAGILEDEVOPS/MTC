'use strict'

const { mtcError } = require('./mtc-error')
const userInitErrorConsts = require('../lib/errors/user')

class DsiSchoolNotFoundError extends mtcError {
  constructor (urn) {
    const message = `School with URN:${urn} is not registered in MTC`
    super(message, message)
    this.code = userInitErrorConsts.schoolNotFound
  }
}

class DsiMissingSchoolInfoError extends mtcError {
  constructor (dfeSignInUser) {
    if (dfeSignInUser.organisation === undefined) {
      const message = `User ${dfeSignInUser.providerUserId} has no organisation data`
      super(message, 'No information about your associated school could be found')
    } else if (dfeSignInUser.organisation.urn === undefined) {
      const message = `User ${dfeSignInUser.providerUserId} has no urn associated with their organisation data`
      super(message, 'We could not find a URN in your associated school data')
    } else {
      const message = `An unknown error occured when signing in user with ID:${dfeSignInUser.providerUserId}`
      super(message, 'An unknown error occured')
    }
  }
}

module.exports = {
  DsiSchoolNotFoundError,
  DsiMissingSchoolInfoError
}
