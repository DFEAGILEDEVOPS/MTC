'use strict'

const ValidationError = require('../../validation-error')
const XRegExp = require('xregexp')
const { isEmpty } = require('validator')

const pattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'

/**
 * validates input against uuid format
 * @param {string} value the value to validate
 * @param {string} name the name to use for the value in error messages
 */
module.exports.validate = function validate (value, name) {
  const validationError = new ValidationError()

  if (!value || isEmpty(value)) {
    validationError.addError(name, `${name} is required`)
    return validationError
  }

  if (!XRegExp(pattern).test(value)) {
    validationError.addError(name, `${name} is not a valid UUID`)
    return validationError
  }

  return validationError
}
