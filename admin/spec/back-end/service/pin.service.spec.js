const moment = require('moment-timezone')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const dateService = require('../../../services/date.service')
const pinValidator = require('../../../lib/validator/pin-validator')
const schoolDataService = require('../../../services/data-access/school.data.service')
const pinService = require('../../../services/pin.service')

const schoolMock = require('../mocks/school')

/* global describe, it, expect, beforeEach, afterEach */

describe('pin.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('getActiveSchool', () => {
    let service
    const school = Object.assign({}, schoolMock)
    school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
    describe('if pin is valid', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(school)
        sandbox.mock(pinValidator).expects('isActivePin').returns(true)
        service = proxyquire('../../../services/pin.service', {
          '../../../services/data-access/school.data.service': schoolDataService,
          '../../../lib/validator/pin-validator': pinValidator
        })
      })
      it('it should return school object', async () => {
        const result = await service.getActiveSchool(school.id)
        expect(result.pinExpiresAt).toBeDefined()
        expect(result.schoolPin).toBeDefined()
      })
    })
    describe('if pin is invalid', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(school)
        sandbox.mock(pinValidator).expects('isActivePin').returns(false)
        service = proxyquire('../../../services/pin.service', {
          '../../../services/data-access/school.data.service': schoolDataService,
          '../../../lib/validator/pin-validator': pinValidator
        })
      })
      it('it should return null', async () => {
        const result = await service.getActiveSchool(school.id)
        expect(result).toBeNull()
      })
    })
  })

  describe('generatePinTimestamp', () => {
    describe('when timezone is not supplied', () => {
      it('should return the override value if override is enabled', () => {
        const overrideEnabled = true
        const defaultValue = moment().startOf('day').add(16, 'hours')
        const overrideValue = moment().endOf('day')
        const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
        expect(pinTimestamp).toStrictEqual(overrideValue)
      })
      it('should return the default value if override is disabled', () => {
        const overrideEnabled = false
        const defaultValue = moment().startOf('day').add(16, 'hours')
        const overrideValue = moment().endOf('day')
        const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
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
        const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, 'Europe/Lisbon')
        expect(pinTimestamp).toStrictEqual(timeZoneOverrideValue)
      })
      it('should return the default value based on the timezone if override is disabled', () => {
        const overrideEnabled = false
        const defaultValue = moment().startOf('day').add(16, 'hours')
        const overrideValue = moment().endOf('day')
        const schoolTimezone = 'Europe/Lisbon'
        const timeZoneDefaultValue = moment.tz(dateService.formatIso8601WithoutTimezone(defaultValue), schoolTimezone).utc()
        const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, schoolTimezone)
        expect(pinTimestamp).toStrictEqual(timeZoneDefaultValue)
      })
    })
  })
})
