'use strict'

const ValidationError = require('../validation-error')
const errorMessages = require('../errors/retro-input-assistant')

const validator = {
  /**
 * Validates access arrangements data for submission
 * @param {Object} retroInputAssistantData
 * @returns {Object}
 */
  validate: function validate (retroInputAssistantData) {
    const validationError = new ValidationError()
    const {
      firstName,
      lastName,
      reason,
      pupilId,
      checkId,
      userId
    } = retroInputAssistantData

    if (!firstName || firstName.length === 0) {
      validationError.addError('firstName', errorMessages.missingFirstName)
    }
    if (!lastName || lastName.length === 0) {
      validationError.addError('lastName', errorMessages.missingLastName)
    }
    if (!reason || reason.length === 0) {
      validationError.addError('reason', errorMessages.missingReason)
    }
    if (!checkId || checkId < 1) {
      validationError.addError('checkId', errorMessages.invalidCheckId)
    }
    if (!pupilId || pupilId < 1) {
      validationError.addError('pupilId', errorMessages.invalidPupilId)
    }
    if (!userId || userId < 1) {
      validationError.addError('userId', errorMessages.userId)
    }
    return validationError
  }
}

module.exports = validator
