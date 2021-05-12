'use strict'

const NAMES = {
  CHECK_STARTED: 'check-started',
  CHECK_SUBMIT: 'check-submitted',
  PUPIL_FEEDBACK: 'pupil-feedback',
  PUPIL_PREFS: 'pupil-prefs',
  TEST_PUPIL_CONNECTION: 'test-pupil-connection'
}

Object.freeze(NAMES)

const nameService = {
  NAMES
}

module.exports = nameService
