const moment = require('moment-timezone')

const dateService = require('../../../services/date.service')
const pinValidator = require('../../../lib/validator/pin-validator')
const schoolDataService = require('../../../services/data-access/school.data.service')
const pinService = require('../../../services/pin.service')
const schoolMock = require('../mocks/school')

/* global jest, describe, beforeEach, test, expect */

describe('pin.service', () => {
  describe('getActiveSchool', () => {
    const school = Object.assign({}, schoolMock)
    school.pinExpiresAt = moment().startOf('day').add(16, 'hours')

    describe('if pin is valid', () => {
      beforeEach(() => {
        jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(school)
        jest.spyOn(pinValidator, 'isActivePin').mockReturnValue(true)
      })

      test('it should return school object', async () => {
        const result = await pinService.getActiveSchool(school.id)
        expect(result.pinExpiresAt).toBeDefined()
        expect(result.schoolPin).toBeDefined()
      })
    })

    describe('if pin is invalid', () => {
      beforeEach(() => {
        jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(school)
        jest.spyOn(pinValidator, 'isActivePin').mockReturnValue(false)
      })

      test('it should return null', async () => {
        const result = await pinService.getActiveSchool(school.id)
        expect(result).toBeNull()
      })
    })

    describe('generatePinTimestamp', () => {
      describe('when timezone is not supplied', () => {
        test('should return the override value if override is enabled', () => {
          const overrideEnabled = true
          const defaultValue = moment().startOf('day').add(16, 'hours')
          const overrideValue = moment().endOf('day')
          const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
          expect(pinTimestamp).toStrictEqual(overrideValue)
        })

        test('should return the default value if override is disabled', () => {
          const overrideEnabled = false
          const defaultValue = moment().startOf('day').add(16, 'hours')
          const overrideValue = moment().endOf('day')
          const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue)
          expect(pinTimestamp).toStrictEqual(defaultValue)
        })
      })

      describe('when timezone is supplied', () => {
        test('should return the override value based on the timezone if override is enabled', () => {
          const overrideEnabled = true
          const defaultValue = moment().startOf('day').add(16, 'hours')
          const overrideValue = moment().endOf('day')
          const schoolTimezone = 'Europe/Lisbon'
          const timeZoneOverrideValue = moment.tz(dateService.formatIso8601WithoutTimezone(overrideValue), schoolTimezone).utc()
          const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, 'Europe/Lisbon')
          expect(pinTimestamp).toStrictEqual(timeZoneOverrideValue)
        })

        test('should return the default value based on the timezone if override is disabled', () => {
          const overrideEnabled = false
          const defaultValue = moment().startOf('day').add(16, 'hours')
          const overrideValue = moment().endOf('day')
          const schoolTimezone = 'Europe/Lisbon'
          const timeZoneDefaultValue = moment.tz(dateService.formatIso8601WithoutTimezone(defaultValue), schoolTimezone).utc()
          const pinTimestamp = pinService.generatePinTimestamp(overrideEnabled, overrideValue, defaultValue, schoolTimezone)
          expect(pinTimestamp).toStrictEqual(timeZoneDefaultValue)
        })

        test('pin expiry during BST', () => {
          // Set the base time up to be just after midnight on Tues 7 April 2020.  BST is in effect, so this should be
          // 11:30pm on 6th April.
          const baseTime = new Date(2020, 3, 6, 23, 30)
          const realTime = Date.now()
          jest.useFakeTimers('modern')
          jest.setSystemTime(baseTime)

          const defaultValue = moment().startOf('day').add(16, 'hours') // 4pm GMT
          const overrideValue = moment().endOf('day')
          const schoolTimezone = 'Europe/London'
          const pinTimestamp = pinService.generatePinTimestamp(false, overrideValue, defaultValue, schoolTimezone)
          console.log('pin timestamp', pinTimestamp.toISOString())
          expect(pinTimestamp.toISOString()).toStrictEqual('2020-04-07T15:00:00.000Z') // 3PM GMT, which is expected
          // when
          // I run this in BST, or 4PM during GMT
          jest.setSystemTime(realTime)
          jest.useRealTimers()
        })

        test('pin expiry during GMT', () => {
          // Set the base time up to be just after midnight on Tues 23 Feb 2020. No DST in effect.
          const baseTime = new Date(2020, 11, 21, 23, 30)
          const realTime = Date.now()
          jest.useFakeTimers('modern')
          jest.setSystemTime(baseTime)

          const defaultValue = moment().startOf('day').add(16, 'hours') // 4pm GMT
          const overrideValue = moment().endOf('day')
          const schoolTimezone = 'Europe/London'
          const pinTimestamp = pinService.generatePinTimestamp(false, overrideValue, defaultValue, schoolTimezone)
          console.log('pin timestamp', pinTimestamp.toISOString())
          expect(pinTimestamp.toISOString()).toStrictEqual('2020-12-21T16:00:00.000Z')

          jest.setSystemTime(realTime)
          jest.useRealTimers()
        })
      })
    })
  })
})
