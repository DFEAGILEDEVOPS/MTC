'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const moment = require('moment-timezone')
const sinon = require('sinon')

const pinGenerationService = require('../../../services/pin-generation.service')
const dateService = require('../../../services/date.service')
const schoolMock = require('../mocks/school')

describe('pin-generation.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('generateSchoolPassword', () => {
    describe('if schoolPin is not valid', () => {
      it('should generate school password', () => {
        const school = Object.assign({}, schoolMock)
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result.pinExpiresAt).toBeDefined()
        expect(result.pin.length).toBe(8)
        expect(/^[a-z]{3}[2-9]{2}[a-z]{3}$/.test(result.pin)).toBe(true)
      })
    })

    describe('if the pin expiration date is before same day 4pm', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
      })
      it('should not generate school password', () => {
        const school = Object.assign({}, schoolMock)
        school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result).toBe(undefined)
      })
    })

    describe('if the pin expiration date is after same day 4pm', () => {
      let school
      beforeEach(() => {
        school = Object.assign({}, schoolMock)
        school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.useFakeTimers(moment().startOf('day').add(100, 'years').valueOf())
      })
      it('it should generate school password ', () => {
        const password = school.pin
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result.pin === password).toBeFalsy()
      })
    })
  })

  describe('generateCryptoRandomNumber', () => {
    it('should generate a random number in specific range', () => {
      const number = pinGenerationService.generateCryptoRandomNumber(1, 6)
      expect(typeof number).toBe('number')
      expect(number >= 0 || number <= 6).toBeTruthy()
    })
  })

  describe('generatePinTimestamp', () => {
    describe('when timezone is not supplied', () => {
      it('should return the override value if override is enabled', () => {
        const overrideEnabled = true
        const defaultValue = moment().startOf('day').add(16, 'hours')
        const overrideValue = moment().endOf('day')
        const pinTimestamp = pinGenerationService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
        expect(pinTimestamp).toStrictEqual(overrideValue)
      })
      it('should return the default value if override is disabled', () => {
        const overrideEnabled = false
        const defaultValue = moment().startOf('day').add(16, 'hours')
        const overrideValue = moment().endOf('day')
        const pinTimestamp = pinGenerationService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
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
        const pinTimestamp = pinGenerationService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, 'Europe/Lisbon')
        expect(pinTimestamp).toStrictEqual(timeZoneOverrideValue)
      })
      it('should return the default value based on the timezone if override is disabled', () => {
        const overrideEnabled = false
        const defaultValue = moment().startOf('day').add(16, 'hours')
        const overrideValue = moment().endOf('day')
        const schoolTimezone = 'Europe/Lisbon'
        const timeZoneDefaultValue = moment.tz(dateService.formatIso8601WithoutTimezone(defaultValue), schoolTimezone).utc()
        const pinTimestamp = pinGenerationService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, schoolTimezone)
        expect(pinTimestamp).toStrictEqual(timeZoneDefaultValue)
      })
    })
  })
})
