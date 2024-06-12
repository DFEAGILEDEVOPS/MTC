'use strict'
/* global describe test expect jest afterEach */

const dateService = require('../../../services/date.service')
const requestMock = require('../mocks/dates-req-mock')
const moment = require('moment')
const logger = require('../../../services/log.service.js').getLogger()

function invalidInputTests (method) {
  test('returns an empty string if the parameter is an empty string', () => {
    jest.spyOn(logger, 'warn').mockImplementation()
    expect(dateService[method]('')).toBe('')
  })

  test('returns an empty string if the parameter is missing', () => {
    jest.spyOn(logger, 'warn').mockImplementation()
    expect(dateService[method]()).toBe('')
  })

  test('returns an empty string if the parameter is null', () => {
    jest.spyOn(logger, 'warn').mockImplementation()
    expect(dateService[method](null)).toBe('')
  })

  test('returns an empty string if the date is invalid', () => {
    jest.spyOn(logger, 'warn').mockImplementation()
    expect(dateService[method]('rotten-input')).toBe('')
  })
}

describe('date service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#formatPupilHistoryDateAndTime', () => {
    test('returns the expected format', () => {
      const date = moment.tz('2024-06-12T13:22:30Z', 'Europe/London')
      expect(dateService.formatPupilHistoryDateAndTime(date)).toBe('12 Jun 14:22 BST')
    })
  })

  describe('#formatFullGdsDate', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatFullGdsDate(date)).toBe('31 December 2010')
    })

    test('can be given a moment object as input', () => {
      const date = moment('2010-12-31 14:10Z')
      expect(dateService.formatFullGdsDate(date)).toBe('31 December 2010')
    })

    invalidInputTests('formatFullGdsDate')
  })

  describe('#formatShortGdsdate', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatShortGdsDate(date)).toBe('31 Dec 2010')
    })

    invalidInputTests('formatShortGdsDate')
  })

  describe('#formatUKDate', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatUKDate(date)).toBe('31/12/2010')
    })

    invalidInputTests('formatUKDate')
  })

  describe('#reverseFormatNoSeparator', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.reverseFormatNoSeparator(date)).toBe('20101231')
    })

    invalidInputTests('reverseFormatNoSeparator')
  })

  describe('#formatTimeWithSeconds', () => {
    test('formats the time correctly, with single digits', () => {
      const date = new Date(2010, 11, 31, 14, 10, 29, 59)
      expect(dateService.formatTimeWithSeconds(date)).toBe('2:10:29 pm')
    })

    test('formats the time correctly, with double digits', () => {
      const date = new Date(2010, 11, 31, 22, 10, 59, 30)
      expect(dateService.formatTimeWithSeconds(date)).toBe('10:10:59 pm')
    })

    invalidInputTests('formatTimeWithSeconds')
  })

  describe('#formatIso8601', () => {
    test('only accept a moment date as the parameter', () => {
      expect(() => dateService.formatIso8601(new Date())).toThrowError('Parameter must be of type Moment')
    })

    test('checks the moment param to make sure it is valid and throws if it isnt', () => {
      // Moment will output a warning because of the deliberately bad arg
      jest.spyOn(console, 'warn').mockImplementation()
      expect(() => dateService.formatIso8601(moment('garbage'))).toThrowError('Not a valid date')
    })

    test('returns the expected ISO date as a String', () => {
      const s = '2017-07-16T14:01:02.123+01:00'
      const m = moment(s).utcOffset('+0100')
      const res = dateService.formatIso8601(m)
      expect(res).toBe(s)
    })
  })

  describe('#formatIso8601WithoutTimezone', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 2, 3)
      expect(dateService.formatIso8601WithoutTimezone(date)).toBe('2010-12-31T14:10:02.003')
    })
  })

  describe('#formatDayAndDate', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatDayAndDate(date)).toBe('Friday, 31 December')
    })
  })

  describe('#formatDayDateAndYear', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatDayDateAndYear(date)).toBe('Friday 31 December 2010')
    })
  })

  describe('#formatDateAndTime', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 12, 13)
      expect(dateService.formatDateAndTime(date)).toBe('31 December 2010 2:10pm')
    })
  })

  describe('#formatDateFromRequest', () => {
    test('should return a date correctly formatted', () => {
      const result1 = dateService.formatDateFromRequest(requestMock, 'adminStartDay', 'adminStartMonth', 'adminStartYear')
      const result2 = dateService.formatDateFromRequest(requestMock, 'checkStartDay', 'checkStartMonth', 'checkStartYear')
      const result3 = dateService.formatDateFromRequest(requestMock, 'checkEndDay', 'checkEndMonth', 'checkEndYear')
      expect(result1.toISOString()).toBe('2018-11-10T00:00:00.000Z')
      expect(result2.toISOString()).toBe('2018-12-09T00:00:00.000Z')
      expect(result3.toISOString()).toBe('2018-12-10T00:00:00.000Z')
    })
  })

  describe('#formatCheckPeriod', () => {
    test('should return a date correctly formatted', () => {
      const result = dateService.formatCheckPeriod(moment('2017-11-01'), moment('2017-11-20'))
      expect(result).toBe('1 Nov to 20 Nov 2017')
    })
  })

  describe('createUTCFromDayMonthYear', () => {
    test('creates a moment date object', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1).toBeTruthy()
    })
    test('sets the date of month', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.date()).toBe(30)
    })
    test('sets the month', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.format('M')).toBe('6')
    })
    test('sets the year', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.year()).toBe(2007)
    })
    test('sets the hours to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.hour()).toBe(0)
    })
    test('sets the minutes to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.minutes()).toBe(0)
    })
    test('sets the seconds to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.seconds()).toBe(0)
    })
    test('sets the milliseconds to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.milliseconds()).toBe(0)
    })
    test('creates a moment date object from strings', () => {
      const res1 = dateService.createUTCFromDayMonthYear('31', '7', '2008')
      expect(res1.toISOString()).toBe('2008-07-31T00:00:00.000Z')
    })
    test('returns null if given an invalid date', () => {
      const res1 = dateService.createUTCFromDayMonthYear(31, 6, 1999)
      expect(res1).toBeNull()
    })
    test('returns null when arguments are missing', () => {
      const res1 = dateService.createUTCFromDayMonthYear(undefined, undefined, undefined)
      expect(res1).toBeNull()
    })
    test('returns null when an argument are null', () => {
      const res1 = dateService.createUTCFromDayMonthYear(null, null, null)
      expect(res1).toBeNull()
    })
  })
  describe('createLocalTimeFromDayMonthYear', () => {
    test('creates a moment date object', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1).toBeTruthy()
    })
    test('sets the date of month', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.date()).toBe(30)
    })
    test('sets the month', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.format('M')).toBe('6')
    })
    test('sets the year', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.year()).toBe(2007)
    })
    test('sets the hours to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.hour()).toBe(0)
    })
    test('sets the minutes to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.minutes()).toBe(0)
    })
    test('sets the seconds to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.seconds()).toBe(0)
    })
    test('sets the milliseconds to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.milliseconds()).toBe(0)
    })
    test('returns null if given an invalid date', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(31, 6, 1999)
      expect(res1).toBeNull()
    })
    test('returns null when arguments are missing', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(undefined, undefined, undefined)
      expect(res1).toBeNull()
    })
    test('returns null when an argument are null', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(null, null, null)
      expect(res1).toBeNull()
    })
    test('returns null when the date is invalid', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(99, 99, 99)
      expect(res1).toBeNull()
    })
  })

  describe('#formatFileName', () => {
    test('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatFileName(date)).toBe('2010-12-31-1410')
    })
    invalidInputTests('formatUKDate')
  })
  describe('#isBetweenInclusive', () => {
    test('returns true if the date matches the start date', () => {
      const testDate = moment('2016-10-30')
      const startDate = moment('2016-10-30')
      const endDate = moment('2016-12-30')
      const result = dateService.isBetweenInclusive(testDate, startDate, endDate)
      expect(result).toBeTruthy()
    })
    test('returns true if the date matches the end date', () => {
      const testDate = moment('2016-12-30')
      const startDate = moment('2016-10-30')
      const endDate = moment('2016-12-30')
      const result = dateService.isBetweenInclusive(testDate, startDate, endDate)
      expect(result).toBeTruthy()
    })
    test('returns true if the date is between the start and end dates', () => {
      const testDate = moment('2016-11-01')
      const startDate = moment('2016-10-30')
      const endDate = moment('2016-12-30')
      const result = dateService.isBetweenInclusive(testDate, startDate, endDate)
      expect(result).toBeTruthy()
    })
    test('returns false if the date is before the start date', () => {
      const testDate = moment('2016-10-29')
      const startDate = moment('2016-10-30')
      const endDate = moment('2016-12-30')
      const result = dateService.isBetweenInclusive(testDate, startDate, endDate)
      expect(result).toBeFalsy()
    })
  })

  describe('getGdsDateRangeLabel', () => {
    test('it lists the whole dates when the dates are not in the same month', () => {
      const d1 = moment('2021-05-01T09:00:00')
      const d2 = moment('2021-06-20T23:59:59')
      const label = dateService.getGdsDateRangeLabel(d1, d2)
      expect(label).toBe('1 May 2021 to 20 June 2021')
    })

    test('produces a condensed version when the two dates are in the same month and year', () => {
      const d1 = moment('2021-06-01T09:00:00')
      const d2 = moment('2021-06-07T23:59:59')
      const label = dateService.getGdsDateRangeLabel(d1, d2)
      expect(label).toBe('1 to 7 June 2021')
    })

    test('handles the edge case when the month is the same but the year is different', () => {
      const d1 = moment('2020-05-01T09:00:00')
      const d2 = moment('2021-06-20T23:59:59')
      const label = dateService.getGdsDateRangeLabel(d1, d2)
      expect(label).toBe('1 May 2020 to 20 June 2021')
    })
  })

  describe('tzStartOfDDay', () => {
    test('gives the start of the day when no tz is given during GMT', () => {
      setupFakeTime(moment('2020-12-20T10:30:00'))
      const dt = dateService.tzStartOfDay()
      expect(dt.toISOString()).toBe('2020-12-20T00:00:00.000Z')
      tearDownFakeTime()
    })

    test('gives the start of the day when no tz is given during BST', () => {
      setupFakeTime(moment('2020-06-23T10:30:00'))
      const dt = dateService.tzStartOfDay()
      expect(dt.toISOString()).toBe('2020-06-22T23:00:00.000Z') // 11pm GMT is midnight BST
      tearDownFakeTime()
    })

    test('gives the start of the day when a TZ is given', () => {
      setupFakeTime(moment('2021-04-12T10:30:00'))
      const dt = dateService.tzStartOfDay('Europe/Prague')
      expect(dt.toISOString()).toBe('2021-04-11T22:00:00.000Z') // Prague is GMT-2 in April
      tearDownFakeTime()
    })
  })

  describe('tzEightAmToday', () => {
    test('works correctly when no tz is given during GMT', () => {
      setupFakeTime(moment('2020-12-20T10:30:00'))
      const dt = dateService.tzEightAmToday()
      expect(dt.toISOString()).toBe('2020-12-20T08:00:00.000Z')
      tearDownFakeTime()
    })

    test('works correctly when when no tz is given during BST', () => {
      setupFakeTime(moment('2020-06-23T10:30:00'))
      const dt = dateService.tzEightAmToday()
      expect(dt.toISOString()).toBe('2020-06-23T07:00:00.000Z') // 7am GMT is 8am BST
      tearDownFakeTime()
    })

    test('works correctly when a TZ is given', () => {
      setupFakeTime(moment('2021-04-12T15:30:00'))
      const dt = dateService.tzEightAmToday('Europe/Prague')
      expect(dt.toISOString()).toBe('2021-04-12T06:00:00.000Z') // Prague is GMT-2 in April
      tearDownFakeTime()
    })
  })

  describe('tzFourPmToday', () => {
    test('works correctly when no tz is given during GMT', () => {
      setupFakeTime(moment('2020-12-20T23:10:00'))
      const dt = dateService.tzFourPmToday()
      expect(dt.toISOString()).toBe('2020-12-20T16:00:00.000Z')
      tearDownFakeTime()
    })

    test('works correctly when when no tz is given during BST', () => {
      setupFakeTime(moment('2020-06-24T00:30:00.000+01:00')) // 12:30am in BST
      const dt = dateService.tzFourPmToday()
      expect(dt.toISOString()).toBe('2020-06-24T15:00:00.000Z') // Should keep the new day, and not lose it.  Note
      // that 1500 GMT is 1600 BST.
      tearDownFakeTime()
    })

    test('works correctly when a TZ is given', () => {
      setupFakeTime(moment('2021-04-12T16:00:00'))
      const dt = dateService.tzFourPmToday('Europe/London')
      expect(dt.toISOString()).toBe('2021-04-12T15:00:00.000Z') //  1500 GMT is 1600 BST.
      tearDownFakeTime()
    })
  })

  describe('tzEndOfDay', () => {
    test('works correctly when no tz is given during GMT', () => {
      setupFakeTime(moment('2020-12-20T23:10:00'))
      const dt = dateService.tzEndOfDay()
      expect(dt.toISOString()).toBe('2020-12-20T23:59:59.999Z')
      tearDownFakeTime()
    })

    test('works correctly when when no tz is given during BST', () => {
      setupFakeTime(moment('2020-06-24T00:30:00.000+01:00')) // 12:30am in BST
      const dt = dateService.tzEndOfDay()
      expect(dt.toISOString()).toBe('2020-06-24T22:59:59.999Z') // Should keep the new day, and not lose it.  Note
      // that 11pm GMT is 12PM BST.
      tearDownFakeTime()
    })

    test('works correctly when a TZ is given', () => {
      setupFakeTime(moment('2021-04-12T16:00:00'))
      const dt = dateService.tzEndOfDay('Europe/London')
      expect(dt.toISOString()).toBe('2021-04-12T22:59:59.999Z') //  11pm GMT is 12PM BST.
      tearDownFakeTime()
    })
  })

  describe('formatPinDate', () => {
    test('it formats the date', () => {
      const tdate = moment('2024-03-12T16:00:00')
      const slot = dateService.formatPinDate(tdate)
      expect(slot).toBe('Tuesday 12 March')
    })

    test('it formats the date single digit', () => {
      const tdate = moment('2024-03-02T16:00:00')
      const slot = dateService.formatPinDate(tdate)
      expect(slot).toBe('Saturday 2 March')
    })

    test('it formats the date in local time', () => {
      const tz = 'Europe/Nicosia'
      const nicosia = moment('2024-03-02T23:00:00') // GMT from the db
      const slot = dateService.formatPinDate(nicosia, tz)
      expect(slot).toBe('Sunday 3 March') // Cyprus is 2 hours ahead
    })
  })

  describe('formatPinExpiryDate', () => {
    test('it formats the date on the hour simply in 12 hour clock', () => {
      const tdate = '2024-12-12T16:00:00Z'
      const slot = dateService.formatPinExpiryTime(tdate)
      expect(slot).toBe('4 pm')
    })

    test('it formats the date with minutes in 12 hour clock (if there are minutes)', () => {
      const tdate = '2024-12-12T23:59:59Z'
      const slot = dateService.formatPinExpiryTime(tdate)
      expect(slot).toBe('11:59 pm')
    })

    test('it formats the date with minutes in 12 hour clock', () => {
      const tz = 'Europe/Nicosia'
      const nicosia = moment('2024-03-02T23:00:00Z') // GMT from the db
      const slot = dateService.formatPinExpiryTime(nicosia, tz)
      expect(slot).toBe('1 am') // Nicosia time
    })
  })
})

/**
 * @param {moment.Moment} baseTime - set the fake time to this moment object
 *
 */
function setupFakeTime (baseTime) {
  if (!moment.isMoment(baseTime)) {
    throw new Error('moment.Moment time expected')
  }
  jest.useFakeTimers('modern')
  jest.setSystemTime(baseTime.toDate())
}

function tearDownFakeTime () {
  const realTime = jest.getRealSystemTime()
  jest.setSystemTime(realTime)
}
