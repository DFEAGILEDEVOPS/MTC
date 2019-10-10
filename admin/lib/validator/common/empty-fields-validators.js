'use strict'

const R = require('ramda')

const { isEmpty } = require('validator')
const ValidationError = require('../../validation-error')

/**
 * Validates fields for empty values
 * @param {Array} fields
 * @returns {Object}
 */
module.exports.validate = function (fields) {
  const validationError = new ValidationError()
  R.forEach(f => {
    if (typeof f.fieldValue !== 'string' || isEmpty(f.fieldValue && f.fieldValue.trim())) {
      validationError.addError(f.fieldKey, f.errorMessage)
    }
  }, fields)
  return validationError
}
