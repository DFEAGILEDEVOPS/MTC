'use strict'
const R = require('ramda')

const schoolDataService = require('../services/data-access/school.data.service')
const schoolImpersonationValidator = require('../lib/validator/school-impersonation-validator')
const schoolAuditDataService = require('../services/data-access/school-audit.data.service')
const schoolImpersonationService = {}

/**
 * Validate and assign school to helpdesk session
 * @param {object} user
 * @param {string} dfeNumber
 * @returns {Promise<Object>}
 */
schoolImpersonationService.setSchoolImpersonation = async (user, dfeNumber) => {
  if (typeof dfeNumber === 'string') {
    const stripNonDigitsRegex = /[^0-9]/g
    dfeNumber = dfeNumber.replace(stripNonDigitsRegex, '')
  }

  const dfeNumberValidationError = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
  // returns a validation error if dfeNumber provided is empty or has incorrect type
  if (dfeNumberValidationError.hasError()) {
    return dfeNumberValidationError
  }
  let school
  try {
    school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  } catch (ignore) {}
  // returns a validation error if the school record is not valid
  const schoolValidationError = schoolImpersonationValidator.isSchoolRecordValid(school)
  if (schoolValidationError.hasError()) {
    return schoolValidationError
  }
  schoolAuditDataService.auditImpersonation(user.id, school.id)
  return schoolImpersonationService.impersonateSchool(user, school)
}

schoolImpersonationService.impersonateSchool = async (user, school) => {
  user.School = school.dfeNumber
  user.schoolId = school.id
  user.timezone = school.timezone
  user.SchoolName = school.name
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
