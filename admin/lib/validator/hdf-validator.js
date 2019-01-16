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

  const firstNameValue = firstName.trim()
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(firstNameValue)) {
    validationError.addError('firstName', hdfErrorMessages.firstNameInvalidChars)
  }

  if (isEmpty(firstNameValue) || firstNameValue.length > 128) {
    validationError.addError('firstName', hdfErrorMessages.firstNameLength)
  }

  const lastNameValue = lastName.trim()
  if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(lastNameValue)) {
    validationError.addError('lastName', hdfErrorMessages.lastNameInvalidChars)
  }

  if (isEmpty(lastNameValue) || lastNameValue.length > 128) {
    validationError.addError('lastName', hdfErrorMessages.lastNameLength)
  }

  if (isHeadteacher !== 'Y') {
    const jobTitleValue = jobTitle.trim()
    if (isEmpty(jobTitleValue) || jobTitleValue.length < 1 || jobTitleValue.length > 128) {
      validationError.addError('jobTitle', hdfErrorMessages.jobTitleLength)
    }
  }

  return validationError
}
