'use strict'

const ValidationError = require('../validation-error')
const { isInt, isFloat } = require('validator')
const settingsErrorMessages = require('../errors/settings')

module.exports.validate = async (settingsData) => {
  const validationError = new ValidationError()
  if (!settingsData.questionTimeLimit || !isFloat(settingsData.questionTimeLimit, { min: 1, max: 60 })) {
    validationError.addError('questionTimeLimit', settingsErrorMessages.questionTimeLimit)
  }
  if (!settingsData.loadingTimeLimit || !isFloat(settingsData.loadingTimeLimit, { min: 1, max: 5 })) {
    validationError.addError('loadingTimeLimit', settingsErrorMessages.loadingTimeLimit)
  }
  if (!settingsData.checkTimeLimit || !isInt(settingsData.checkTimeLimit, { min: 10, max: 90 })) {
    validationError.addError('checkTimeLimit', settingsErrorMessages.checkTimeLimit)
  }
  return validationError
}
