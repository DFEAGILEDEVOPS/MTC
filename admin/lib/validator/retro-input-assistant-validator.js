'use strict'

const ValidationError = require('../validation-error')
const uuidValidator = require('./common/uuid-validator')
const errorMessages = require('../errors/retro-input-assistant')
const XRegExp = require('xregexp')

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

    if (!firstName || firstName.length === 0 || firstName.length > 128) {
      validationError.addError('firstName', errorMessages.invalidFirstName)
    }
    if (firstName && firstName.length > 0) {
      if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(firstName.trim())) {
        validationError.addError('firstName', errorMessages.firstNameNoSpecialChars)
      }
    }
    if (!lastName || lastName.length === 0 || lastName.length > 128) {
      validationError.addError('lastName', errorMessages.invalidLastName)
    }
    if (lastName && lastName.length > 0) {
      if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(lastName.trim())) {
        validationError.addError('lastName', errorMessages.lastNameNoSpecialChars)
      }
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
