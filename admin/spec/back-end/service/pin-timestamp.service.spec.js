'use strict'
/* global describe, it, expect */

const moment = require('moment-timezone')

const pinTimestampService = require('../../../services/pin-timestamp.service')
const dateService = require('../../../services/date.service')

describe('generatePinTimestamp', () => {
  describe('when timezone is not supplied', () => {
    it('should return the override value if override is enabled', () => {
      const overrideEnabled = true
      const defaultValue = moment().startOf('day').add(16, 'hours')
      const overrideValue = moment().endOf('day')
      const pinTimestamp = pinTimestampService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
      expect(pinTimestamp).toStrictEqual(overrideValue)
    })
    it('should return the default value if override is disabled', () => {
      const overrideEnabled = false
      const defaultValue = moment().startOf('day').add(16, 'hours')
      const overrideValue = moment().endOf('day')
      const pinTimestamp = pinTimestampService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
      expect(pinTimestamp).toStrictEqual(defaultValue)
    })
  })
  describe('when timezone is supplied', () => {
    it('should return the override value based on the timezone if override is enabled', () => {
      const overrideEnabled = true
      const defaultValue = moment().startOf('day').add(16, 'hours')
      const overrideValue = moment().endOf('day')
      const schoolTimezone = 'Europe/Lisbon'
      const timeZoneOverrideValue = moment.tz(dateService.formatIso8601WithoutTimezone(overrideValue), schoolTimezone).utc()
      const pinTimestamp = pinTimestampService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, 'Europe/Lisbon')
      expect(pinTimestamp).toStrictEqual(timeZoneOverrideValue)
    })
    it('should return the default value based on the timezone if override is disabled', () => {
      const overrideEnabled = false
      const defaultValue = moment().startOf('day').add(16, 'hours')
      const overrideValue = moment().endOf('day')
      const schoolTimezone = 'Europe/Lisbon'
      const timeZoneDefaultValue = moment.tz(dateService.formatIso8601WithoutTimezone(defaultValue), schoolTimezone).utc()
      const pinTimestamp = pinTimestampService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, schoolTimezone)
      expect(pinTimestamp).toStrictEqual(timeZoneDefaultValue)
    })
  })
})
