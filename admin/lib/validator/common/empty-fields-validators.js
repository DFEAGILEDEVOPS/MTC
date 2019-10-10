'use strict'

const R = require('ramda')
const RA = require('ramda-adjunct')

const ValidationError = require('../../validation-error')

/**
 * Validates fields for empty values
 * @param {Array} fields
 * @returns {Object}
 */
module.exports.validate = function (fields) {
  const validationError = new ValidationError()
  R.forEach(f => {
    if (!f.fieldValue || RA.isEmptyString(f.fieldValue && f.fieldValue.trim())) {
      validationError.addError(f.fieldKey, f.errorMessage)
    }
  }, fields)
  return validationError
}
