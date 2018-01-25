'use strict'
const moment = require('moment')
const ValidationError = require('../validation-error')
const addPupilErrorMessages = require('../errors/pupil').addPupil
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')
const upnService = require('../../services/upn.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')

module.exports.validate = async (pupilData) => {
  // TODO: Move to reusable validation service
  let validationError = new ValidationError()
  // Forename validation
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(pupilData.foreName)) {
    validationError.addError('foreName', addPupilErrorMessages.firstNameInvalidCharacters)
  }
  if (isEmpty(pupilData.foreName.trim()) || pupilData.foreName.length > 128) {
    validationError.addError('foreName', addPupilErrorMessages.firstNameRequired)
  }
  // Middlenames validation
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(pupilData.middleNames) && !isEmpty(pupilData.middleNames)) {
    validationError.addError('middleNames', addPupilErrorMessages.middleNameInvalidCharacters)
  }
  if (pupilData.middleNames.length >= 128) {
    validationError.addError('middleNames', addPupilErrorMessages.middleNameMaxLengthExceeded)
  }
  // Lastname validation
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(pupilData.lastName)) {
    validationError.addError('lastName', addPupilErrorMessages.lastNameInvalidCharacters)
  }
  if (isEmpty(pupilData.lastName.trim()) || pupilData.lastName.length > 128) {
    validationError.addError('lastName', addPupilErrorMessages.lastNameRequired)
  }
  // DoB Day Validation
  if (!isInt(pupilData['dob-day'], { min: 1, max: 31 })) {
    validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
  }
  if (!XRegExp('^[0-9]+$').test(pupilData['dob-day'])) {
    validationError.addError('dob-day', addPupilErrorMessages.dobInvalidChars)
  }
  if (isEmpty(pupilData['dob-day'].trim())) {
    validationError.addError('dob-day', addPupilErrorMessages.dobRequired)
  }
  // DoB Month Validation
  if (!isInt(pupilData['dob-month'], { min: 1, max: 12 })) {
    validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
  }
  if (!XRegExp('^[0-9]+$').test(pupilData['dob-month'])) {
    validationError.addError('dob-month', addPupilErrorMessages.dobInvalidChars)
  }
  if (isEmpty(pupilData['dob-month'].trim())) {
    validationError.addError('dob-month', addPupilErrorMessages.dobRequired)
  }
  // DoB year Validation
  if (!isInt(pupilData['dob-year'], { min: (new Date().getFullYear() - 10), max: (new Date().getFullYear()) })) {
    validationError.addError('dob-year', addPupilErrorMessages['dob-year'])
  }
  if (!XRegExp('^[0-9]+$').test(pupilData['dob-year'])) {
    validationError.addError('dob-year', addPupilErrorMessages.dobInvalidChars)
  }
  if (isEmpty(pupilData['dob-year'].trim())) {
    validationError.addError('dob-year', addPupilErrorMessages.dobRequired)
  }
  // We need to run additional tests for the date of birth
  // Use the strict flag when parsing the arguments, otherwise empty inputs could cause the current day / month to be used
  // instead.
  const dobData = pupilData['dob-day'].padStart(2, '0') + '/' + pupilData['dob-month'].padStart(2, '0') + '/' + pupilData['dob-year']
  const dob = moment.utc(dobData, 'DD/MM/YYYY', true)
  if (dob.isValid()) {
    if (dob > moment().toDate()) {
      validationError.addError('dob-day', addPupilErrorMessages.dobNoFuture)
      validationError.addError('dob-month', addPupilErrorMessages.dobNoFuture)
      validationError.addError('dob-year', addPupilErrorMessages.dobNoFuture)
    }
  } else {
    // Invalid
    // We need to specify a different error messages if fields have the wrong number of digits
    if (/^\d{3,}$/.test(pupilData['dob-day'])) {
      validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
    }
    if (/^\d{3,}$/.test(pupilData['dob-month'])) {
      validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
    }
    if (!(validationError.isError('dob-day') || validationError.isError('dob-month') || validationError.isError('dob-year'))) {
      validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
      validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
      validationError.addError('dob-year', addPupilErrorMessages['dob-year'])
    }
  }
  // Gender Validation
  if (!(/^(M|F)$/).test(pupilData['gender'])) {
    validationError.addError('gender', addPupilErrorMessages.genderRequired)
  }
  // UPN Validation
  const upn = pupilData['upn'].trim().toUpperCase()
  const expected = upnService.calculateCheckLetter(upn.substring(1))
  if (expected !== upn[0]) {
    // winston.info(`UPN check letter validation failed for [${upn}]: expected [${expected}] but got [${upn[0]}]`)
    validationError.addError('upn', addPupilErrorMessages.upnInvalidCheckDigit)
  }
  if (!upnService.hasValidLaCode(upn)) {
    // winston.info(`upnHasValidLaCode: val: [${upn}] failed check guard`)
    validationError.addError('upn', addPupilErrorMessages.upnInvalidLaCode)
  }
  if (!(/^[A-Z]\d{11}[0-9A-Z]$/.test(upn))) {
    // winston.info(`UPN upnHasValidChars5To12 for [${upn}] failed regex check`)
    validationError.addError('upn', addPupilErrorMessages.upnInvalidCharacters5To12)
  }
  if (upn.length !== 13) {
    // winston.info(`upnHasValidChar13: val: [${upn}] failed length check`)
    validationError.addError('upn', addPupilErrorMessages.upnInvalidCharacter13)
  }
  const char = upn[12] // 13th char
  if (!/^[ABCDEFGHJKLMNPQRTUVWXYZ0-9]$/.test(char)) {
    // winston.info(`upnHasValidChar13: val: [${upn}] failed char 13 check`)
    validationError.addError('upn', addPupilErrorMessages.upnInvalidCharacter13)
  }
  if (isEmpty(upn)) {
    validationError.addError('upn', addPupilErrorMessages.upnRequired)
  }
  // Check that the UPN is unique
  if (!(validationError.get('upn'))) {
    const existingPupil = await pupilDataService.sqlFindOneByUpn(pupilData.upn)
    // if pupil is not stored already under the same id and UPN
    if (existingPupil && existingPupil.urlSlug.toString() !== pupilData.urlSlug &&
      existingPupil.upn === pupilData.upn) {
      validationError.addError('upn', addPupilErrorMessages.upnDuplicate)
    }
  }
  return validationError
}
