'use strict'

const { isEmpty } = require('validator')
const XRegExp = require('xregexp')

const ValidationError = require('../validation-error')
const hdfErrorMessages = require('../errors/hdf')

/**
 * Validates HDF data for submission
 * @param {Object} hdfData
 * @returns {Object}
 */
module.exports.validate = function (hdfData) {
  const validationError = new ValidationError()
  const {
    firstName,
    lastName,
    isHeadteacher,
    jobTitle
  } = hdfData

  const FirstNameValue = firstName.trim()
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(FirstNameValue)) {
    validationError.addError('firstName', hdfErrorMessages.firstNameInvalidChars)
  }

  if (isEmpty(FirstNameValue) || FirstNameValue.length > 128) {
    validationError.addError('firstName', hdfErrorMessages.firstNameLength)
  }

  const LastNameValue = lastName.trim()
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(LastNameValue)) {
    validationError.addError('lastName', hdfErrorMessages.lastNameInvalidChars)
  }

  if (isEmpty(LastNameValue) || LastNameValue.length > 128) {
    validationError.addError('lastName', hdfErrorMessages.lastNameLength)
  }

  if (isHeadteacher !== 'Y') {
    const JobTitleValue = jobTitle.trim()
    if (isEmpty(JobTitleValue) || JobTitleValue.length < 1 || JobTitleValue.length > 128) {
      validationError.addError('jobTitle', hdfErrorMessages.jobTitleLength)
    }
  }

  return validationError
}
