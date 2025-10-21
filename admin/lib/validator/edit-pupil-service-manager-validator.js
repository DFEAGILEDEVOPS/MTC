'use strict'
const moment = require('moment')
const ValidationError = require('../validation-error')
const addPupilErrorMessages = require('../errors/pupil').addPupil
const XRegExp = require('xregexp')
const { isEmpty, isInt } = require('validator')
const upnService = require('../../services/upn.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')

/**
 * @param {any} pupilData
 * @param {number} schoolId
 * @param {boolean} isMultiplePupilsSubmission
 * @returns {Promise<ValidationError>}
 */
module.exports.validate = async (pupilData, schoolId) => {
  // TODO: Move to reusable validation service
  const validationError = new ValidationError()
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
  if (pupilData.middleNames.length > 128) {
    validationError.addError('middleNames', addPupilErrorMessages.middleNameMaxLengthExceeded)
  }
  // Lastname validation
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(pupilData.lastName)) {
    validationError.addError('lastName', addPupilErrorMessages.lastNameInvalidCharacters)
  }
  if (isEmpty(pupilData.lastName.trim()) || pupilData.lastName.length > 128) {
    validationError.addError('lastName', addPupilErrorMessages.lastNameRequired)
  }
  // Forename Alias validation
  if (pupilData.foreNameAlias && !XRegExp('^[\\p{Latin}-\' 0-9]+$').test(pupilData.foreNameAlias) && !isEmpty(pupilData.foreNameAlias)) {
    validationError.addError('foreNameAlias', addPupilErrorMessages.foreNameAliasInvalidCharacters)
  }
  if (pupilData.foreNameAlias && pupilData.foreNameAlias.length > 128) {
    validationError.addError('foreNameAlias', addPupilErrorMessages.foreNameAliasMaxLengthExceeded)
  }

  // Lastname Alias validation
  if (pupilData.lastNameAlias && !XRegExp('^[\\p{Latin}-\' 0-9]+$').test(pupilData.lastNameAlias) && !isEmpty(pupilData.lastNameAlias)) {
    validationError.addError('lastNameAlias', addPupilErrorMessages.lastNameAliasInvalidCharacters)
  }
  if (pupilData.lastNameAlias && pupilData.lastNameAlias.length > 128) {
    validationError.addError('lastNameAlias', addPupilErrorMessages.lastNameAliasMaxLengthExceeded)
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
  if (!isInt(pupilData['dob-year']) || pupilData['dob-year'].length !== 4) {
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
  const currentUTCDate = moment.utc()
  const currentYear = currentUTCDate.year()
  const academicYear = currentUTCDate.isBetween(moment.utc(`${currentYear}-01-01`),
    moment.utc(`${currentYear}-08-31`), null, '[]') ?
    currentYear - 1 :
    currentYear
  // Invalid case
  // We need to specify a different error messages if fields have the wrong number of digits
  if (!dob.isValid() && /^\d{3,}$/.test(pupilData['dob-day'])) {
    validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
  }
  if (!dob.isValid() && /^\d{3,}$/.test(pupilData['dob-month'])) {
    validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
  }
  if (!dob.isValid() && !(validationError.isError('dob-day') || validationError.isError('dob-month') || validationError.isError('dob-year'))) {
    validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
    validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
    validationError.addError('dob-year', addPupilErrorMessages['dob-year'])
  }
  if (dob.isValid() && dob.isAfter(moment.utc())) {
    validationError.addError('dob-day', addPupilErrorMessages.dobInFuture)
    validationError.addError('dob-month', addPupilErrorMessages.dobInFuture)
    validationError.addError('dob-year', addPupilErrorMessages.dobInFuture)
  }

  // Gender Validation
  if (!(/^(m|f)$/i).test(pupilData.gender)) {
    validationError.addError('gender', addPupilErrorMessages.genderRequired)
  }
  // UPN Validation
  const upn = pupilData.upn.trim().toUpperCase()
  const expected = upnService.calculateCheckLetter(upn.substring(1))
  const upnErrorArr = []
  if (!isEmpty(upn) && expected !== upn[0]) {
    upnErrorArr.push(addPupilErrorMessages.upnInvalidCheckDigit)
  }
  const isValidLaCode = await upnService.hasValidLaCode(upn)
  if (!isEmpty(upn) && !isValidLaCode) {
    upnErrorArr.push(addPupilErrorMessages.upnInvalidLaCode)
  }
  const characters5to12 = upn && upn.length > 0 && upn.substring(4, 12)
  if (!isEmpty(upn) && characters5to12 && !/^\d{8}$/.test(characters5to12)) {
    upnErrorArr.push(addPupilErrorMessages.upnInvalidCharacters5To12)
  }
  // if (!isEmpty(upn) && !(/^[A-Z]\d{11}[0-9A-Z]$/.test(upn))) {
  //   upnErrorArr.push(addPupilErrorMessages.upnInvalidCharacters5To12)
  // }
  if (!isEmpty(upn) && (upn.length !== 13 || (!/^[ABCDEFGHJKLMNPQRTUVWXYZ0-9]$/.test(upn[12])))) {
    upnErrorArr.push(addPupilErrorMessages.upnInvalidCharacter13)
  }
  if (isEmpty(upn)) {
    upnErrorArr.push(addPupilErrorMessages.upnRequired)
  }
  // Check that the UPN is unique, if there are no other UPN errors (those would short circuit this check)
  if (upnErrorArr.length === 0) {
    const existingPupil = await pupilDataService.sqlFindOneByUpnAndSchoolId(upn, schoolId)
    // if pupil is not stored already under the same id and UPN
    if (!isEmpty(upn) && existingPupil &&
      existingPupil.urlSlug.toString() !== pupilData.urlSlug &&
      existingPupil.upn === upn) {
      upnErrorArr.push(addPupilErrorMessages.upnDuplicate)
    }
  }
  if (upnErrorArr.length > 0) {
    validationError.addError('upn', upnErrorArr)
  }
  return validationError
}
