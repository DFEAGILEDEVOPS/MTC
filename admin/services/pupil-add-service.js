'use strict'

// const ValidationError = require('../lib/validation-error')
const pupilValidator = require('../lib/validator/pupil-validator')
const dateService = require('./date.service')
const pupilDataService = require('./data-access/pupil.data.service')

const pupilAddService = {}

pupilAddService.addPupil = async function (pupilData) {
  // Validate the data
  const validationError = await pupilValidator.validate(pupilData)
  if (validationError.hasError()) {
    throw validationError
  }

  // Create the date of birth
  pupilData.dob = dateService.createFromDayMonthYear(pupilData['dob-day'], pupilData['dob-month'], pupilData['dob-year'])
  delete pupilData['dob-day']
  delete pupilData['dob-month']
  delete pupilData['dob-year']

  // Save and return the pupil
  return pupilDataService.save(pupilData)
}

module.exports = pupilAddService
