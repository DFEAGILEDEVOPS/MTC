const schoolDataService = require('../services/data-access/school.data.service')
const pinValidator = require('../lib/validator/pin-validator')
const pinService = {}

/**
 * Get active school Password
 * @param {number} dfeNumber
 * @returns {String}
 */
pinService.getActiveSchool = async (dfeNumber) => {
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  if (!pinValidator.isActivePin(school.pin, school.pinExpiresAt)) {
    return null
  }
  return school
}

module.exports = pinService
