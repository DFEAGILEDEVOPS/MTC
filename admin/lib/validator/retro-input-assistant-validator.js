'use strict'

const ValidationError = require('../validation-error')
const uuidValidator = require('./common/uuid-validator')
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
      pupilUuid,
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
    const uuidValidation = uuidValidator.validate(pupilUuid, 'pupilUuid')
    if (uuidValidation.hasError()) {
      validationError.addError('pupilUuid', errorMessages.invalidPupilUuid)
    }
    if (!userId || userId < 1) {
      validationError.addError('userId', errorMessages.userId)
    }
    return validationError
  }
}

module.exports = validator
