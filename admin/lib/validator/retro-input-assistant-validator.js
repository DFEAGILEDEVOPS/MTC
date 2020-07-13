'use strict'
const ValidationError = require('../validation-error')
const uuidValidator = require('./common/uuid-validator')
const errorMessages = require('../errors/retro-input-assistant')

/**
 * Validates access arrangements data for submission
 * @param {Object} retroInputAssistantData
 * @returns {Object}
 */
module.exports.validate = (retroInputAssistantData) => {
  const validationError = new ValidationError()
  const {
    firstName,
    lastName,
    reason,
    pupilUuid,
    checkId
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
  const uuidValidationResult = uuidValidator.validate(pupilUuid, 'pupilUuid')
  if (uuidValidationResult.hasError()) {
    validationError.addError('pupilUuid', errorMessages.invalidPupilUuid)
  }

  return validationError
}
