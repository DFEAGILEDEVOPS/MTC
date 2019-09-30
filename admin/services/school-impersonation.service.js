'use strict'
const R = require('ramda')

const schoolDataService = require('../services/data-access/school.data.service')
const schoolImpersonationEmptyValueValidator = require('../lib/validator/school-impersonation/school-impersonation-empty-value-validator')
const schoolImpersonationDfeNumberValidator = require('../lib/validator/school-impersonation/school-impersonation-dfe-number-validator')

const schoolImpersonationService = {}

/**
 * Validate and assign school to helpdesk session
 * @param {object} user
 * @param {string} dfeNumber
 * @returns {Object}
 */
schoolImpersonationService.validateCreateImpersonation = async (user, dfeNumber) => {
  let validationError
  validationError = schoolImpersonationEmptyValueValidator.validate(dfeNumber)
  if (validationError.hasError()) {
    return validationError
  }
  let school
  try {
    school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  } catch (error) {}
  validationError = schoolImpersonationDfeNumberValidator.validate(school)
  if (validationError.hasError()) {
    return validationError
  }
  user.School = school.dfeNumber
  user.schoolId = school.id
  user.timezone = school.timezone
  return user
}

/**
 * Remove impersonation data from request.user object
 * @param {object} user
 * @returns {void}
 */
schoolImpersonationService.removeImpersonation = (user) => {
  R.forEach(k => delete user[k], ['School', 'schoolId', 'timezone'])
}

module.exports = schoolImpersonationService
