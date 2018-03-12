'use strict'

const R = require('ramda')
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
  const saveData = R.omit(['dob-day', 'dob-month', 'dob-year'], pupilData)
  saveData.dateOfBirth = dateService.createUTCFromDayMonthYear(pupilData['dob-day'], pupilData['dob-month'], pupilData['dob-year'])

  // Trim and uppercase the UPN
  saveData.upn = R.pathOr('', ['upn'], pupilData).trim().toUpperCase()

  // Save and return the pupil
  const res = await pupilDataService.sqlCreate(saveData)
  return pupilDataService.sqlFindOneById(res.insertId)
}

module.exports = pupilAddService
