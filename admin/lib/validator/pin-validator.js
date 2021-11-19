'use strict'

const moment = require('moment')
const dateService = require('../../services/date.service')

const pinValidator = {}

/**
 * Validate pin
 * @param {string} pin
 * @param {moment.Moment} pinExpiresAt
 * @returns {Boolean}
 */
pinValidator.isActivePin = (pin, pinExpiresAt) => {
  if (!pinExpiresAt || !pin) return false
  return moment(pinExpiresAt).isAfter(dateService.utcNowAsMoment())
}

module.exports = pinValidator
