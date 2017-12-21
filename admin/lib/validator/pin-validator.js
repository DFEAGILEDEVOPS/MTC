const moment = require('moment')

const pinValidator = {}

/**
 * Validate pin
 * @param {string} pin
 * @param {Moment} pinExpiresAt
 * @returns {Boolean}
 */
pinValidator.isActivePin = (pin, pinExpiresAt) => {
  if (!pinExpiresAt || !pin) return false
  return pinExpiresAt.isAfter(moment.utc())
}

module.exports = pinValidator
