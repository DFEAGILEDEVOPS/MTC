const dateService = require('../services/date.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pinValidator = require('../lib/validator/pin-validator')
const pinService = {}

/**
 * Get active school Password
 * @param {number} dfeNumber
 * @returns {Promise<String>}
 */
pinService.getActiveSchool = async (dfeNumber) => {
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  if (!pinValidator.isActivePin(school.pin, school.pinExpiresAt)) {
    return null
  }
  return school
}

/**
 * Generate EXPIRY timestamp value based on parameters
 * @param {boolean} overrideEnabled
 * @param {string} schoolTimezone
 * @returns {import('moment').Moment}
 */

pinService.generatePinTimestamp = (overrideEnabled, schoolTimezone = null) => {
  let pinTimestamp
  if (overrideEnabled) {
    pinTimestamp = dateService.tzEndOfDay(schoolTimezone)
  } else {
    pinTimestamp = dateService.tzFourPmToday(schoolTimezone)
  }
  return pinTimestamp.utc() // work with utc internally
}

/**
 * Generate ENTRY timestamp value based on parameters
 * @param {boolean} overrideEnabled
 * @param {string} schoolTimezone
 * @returns {import('moment').Moment}
 */

pinService.generatePinValidFromTimestamp = (overrideEnabled, schoolTimezone = null) => {
  let pinTimestamp
  if (overrideEnabled) {
    pinTimestamp = dateService.tzStartOfDay(schoolTimezone)
  } else {
    pinTimestamp = dateService.tzEightAmToday(schoolTimezone)
  }
  return pinTimestamp.utc()
}

module.exports = pinService
