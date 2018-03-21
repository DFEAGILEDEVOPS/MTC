const ValidationError = require('../validation-error')
const restartErrorMessages = require('../errors/restart')
const pupilRestartReasons = require('../consts/pupil-restart-reasons')
const restartValidator = {}

/**
 * Validate restart reason
 * @param {String} restartCode
 * @param {String} reason
 * @returns {Boolean}
 */
restartValidator.validateReason = (restartCode, reason) => {
  const validationError = new ValidationError()
  if (reason.length > 0) return validationError
  if (restartCode === pupilRestartReasons.classroomDisruption) {
    validationError.addError('classDisruptionInfo', restartErrorMessages.errorMessage)
  }
  if (restartCode === pupilRestartReasons.didNotComplete) {
    validationError.addError('didNotCompleteInfo', restartErrorMessages.errorMessage)
  }
  return validationError
}

module.exports = restartValidator
