const ValidationError = require('../validation-error')
const restartErrorMessages = require('../errors/restart')
const restartValidator = {}

/**
 * Validate restart reason
 * @param reason
 * @param specifyReason
 * @returns {Boolean}
 */
restartValidator.validateReason = (reason, specifyReason) => {
  const validationError = new ValidationError()
  if (reason === 'DNC' && specifyReason.length === 0) {
    validationError.addError('didNotCompleteInfo', restartErrorMessages.didNotCompleteInfo)
  }
  return validationError
}

module.exports = restartValidator
