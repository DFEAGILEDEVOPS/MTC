const ValidationError = require('../validation-error')
const restartValidator = {}

/**
 * Validate restart reason
 * @param reason
 * @param specifyReason
 * @returns {Boolean}
 */
restartValidator.validateReason = (reason, specifyReason) => {
  const validationError = new ValidationError()
  if (reason === 'Did not complete' && specifyReason.length === 0) {
    validationError.addError('didNotCompleteInfo', 'Error: Please specify further information when "Did not complete" option is selected')
  }
  return validationError
}

module.exports = restartValidator
