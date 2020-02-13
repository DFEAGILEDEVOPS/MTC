const moment = require('moment')

const dateService = require('../services/date.service')

const pinTimestampService = {}

/**
 * Generate timestamp value based on parameters
 * @param {boolean} overrideEnabled
 * @param {moment} overrideValue
 * @param {moment} defaultValue
 * @param {string} schoolTimezone
 * @return {moment} pinTimestamp
 */

pinTimestampService.generatePinTimestamp = (overrideEnabled, overrideValue, defaultValue, schoolTimezone = null) => {
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

module.exports = pinTimestampService
