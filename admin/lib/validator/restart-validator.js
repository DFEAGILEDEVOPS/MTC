const ValidationError = require('../validation-error')
const restartErrorMessages = require('../errors/restart')
const config = require('../../config')
const restartValidator = {}

/**
 * Validate restart reason
 * @param reason
 * @param specifyReason
 * @returns {Boolean}
 */
restartValidator.validateReason = (reason, specifyReason) => {
  const { validationRestartCodes } = config.Data
  const validationError = new ValidationError()
  validationRestartCodes.map(v => {
    if (v.type === reason && specifyReason.length === 0) {
      validationError.addError(v.field, restartErrorMessages.errorMessage)
    }
  })
  return validationError
}

module.exports = restartValidator
