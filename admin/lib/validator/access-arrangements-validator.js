'use strict'
const ValidationError = require('../validation-error')
const toBool = require('to-bool')
const accessArrangementsErrorMessages = require('../errors/access-arrangements')

/**
 * Validates access arrangements data for submission
 * @param {Object} accessArrangementsData
 * @returns {Object}
 */
module.exports.validate = (accessArrangementsData) => {
  const validationError = new ValidationError()
  const {
    pupilUrlSlug,
    accessArrangements: accessArrangementsCodes,
    isEditView
  } = accessArrangementsData

  if (!pupilUrlSlug && !toBool(isEditView)) {
    validationError.addError('pupil-autocomplete-container', accessArrangementsErrorMessages.missingPupilName)
  }
  if ((!accessArrangementsCodes || accessArrangementsCodes.length === 0) && !toBool(isEditView)) {
    validationError.addError('accessArrangementsList', accessArrangementsErrorMessages.missingAccessArrangements)
  }
  return validationError
}
