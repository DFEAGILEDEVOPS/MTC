const moment = require('moment')

const generatePinsValidationService = {}

/**
 * Validate pin
 * @param pin
 * @param pinExpiresAt
 * @returns {Boolean}
 */
generatePinsValidationService.isValidPin = (pin, pinExpiresAt) => {
  if (!pinExpiresAt || !pin) return false
  return moment(pinExpiresAt).isAfter(moment.utc())
}

module.exports = generatePinsValidationService
