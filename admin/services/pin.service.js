const moment = require('moment-timezone')
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
 * Generate timestamp value based on parameters
 * @param {boolean} overrideEnabled
 * @param {moment.Moment} overrideValue
 * @param {moment.Moment} defaultValue
 * @param {string} schoolTimezone
 * @returns {moment.Moment}
 */

pinService.generatePinTimestamp = (overrideEnabled, overrideValue, defaultValue, schoolTimezone = null) => {
  let pinTimestamp
  if (overrideEnabled) {
    pinTimestamp = overrideValue
  } else {
    pinTimestamp = defaultValue
  }
  if (schoolTimezone) {
    // needed to parse the date in the specified timezone and convert to utc for storing
    pinTimestamp = moment.tz(dateService.formatIso8601WithoutTimezone(pinTimestamp), schoolTimezone).utc()
  }
  return pinTimestamp
}

module.exports = pinService
