const moment = require('moment')

const pinValidator = {}

/**
 * Validate pin
 * @param pin
 * @param pinExpiresAt
 * @returns {Boolean}
 */
pinValidator.isActivePin = (pin, pinExpiresAt) => {
  if (!pinExpiresAt || !pin) return false
  return moment(pinExpiresAt).isAfter(moment.utc())
}

module.exports = pinValidator
