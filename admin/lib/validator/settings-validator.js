'use strict'

const ValidationError = require('../validation-error')
const errorConverter = require('../error-converter')
const settingsErrorMessages = require('../errors/settings')

const settingsValidationSchema = {
  'questionTimeLimit': {
    notEmpty: true,
    isFloat: {
      options: [{min: 1, max: 60}] // Max number to be confirmed
    },
    errorMessage: settingsErrorMessages.questionTimeLimit
  },
  'loadingTimeLimit': {
    notEmpty: true,
    isFloat: {
      options: [{min: 1, max: 5}] // Max number to be confirmed
    },
    errorMessage: settingsErrorMessages.loadingTimeLimit
  }
}

module.exports.validate = function (req) {
  return new Promise(async function (resolve, reject) {
    let validationError = new ValidationError()
    try {
      req.checkBody(settingsValidationSchema)
      let result = await req.getValidationResult()
      validationError = errorConverter.fromExpressValidator(result.mapped())
    } catch (error) {
      return reject(error)
    }
    resolve(validationError)
  })
}
