'use strict'
/* global describe it expect spyOn */

const dateService = require('../../services/date.service')
const requestMock = require('../mocks/dates-req-mock')
const moment = require('moment')
const winston = require('winston')

function invalidInputTests (method) {
  it('returns an empty string if the parameter is an empty string', () => {
    spyOn(winston, 'warn')
    expect(dateService[method]('')).toBe('')
  })

  it('returns an empty string if the parameter is missing', () => {
    spyOn(winston, 'warn')
    expect(dateService[method]()).toBe('')
  })

  it('returns an empty string if the parameter is null', () => {
    spyOn(winston, 'warn')
    expect(dateService[method](null)).toBe('')
  })

  it('returns an empty string if the date is invalid', () => {
    spyOn(winston, 'warn')
    expect(dateService[method]('rotten-input')).toBe('')
  })
}

describe('date service', () => {
  describe('#formatFullGdsDate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatFullGdsDate(date)).toBe('31 December 2010')
    })

    it('can be given a moment object as input', () => {
      const date = moment('2010-12-31 14:10Z')
      expect(dateService.formatFullGdsDate(date)).toBe('31 December 2010')
    })

    invalidInputTests('formatFullGdsDate')
  })

  describe('#formatShortGdsdate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatShortGdsDate(date)).toBe('31 Dec 2010')
    })

    invalidInputTests('formatShortGdsDate')
  })

  describe('#formatUKDate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatUKDate(date)).toBe('31/12/2010')
    })

    invalidInputTests('formatUKDate')
  })

  describe('#reverseFormatNoSeparator', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.reverseFormatNoSeparator(date)).toBe('20101231')
    })

    invalidInputTests('reverseFormatNoSeparator')
  })

  describe('#formatTimeWithSeconds', () => {
    it('formats the time correctly, with single digits', () => {
      const date = new Date(2010, 11, 31, 14, 10, 29, 59)
      expect(dateService.formatTimeWithSeconds(date)).toBe('2:10:29 pm')
    })

    it('formats the time correctly, with double digits', () => {
      const date = new Date(2010, 11, 31, 22, 10, 59, 30)
      expect(dateService.formatTimeWithSeconds(date)).toBe('10:10:59 pm')
    })

    invalidInputTests('formatTimeWithSeconds')
  })

  describe('#formatIso8601', () => {
    it('only accept a moment date as the parameter', () => {
      expect(() => dateService.formatIso8601(new Date())).toThrowError('Parameter must be of type Moment')
    })

    it('checks the moment param to make sure it is valid and throws if it isnt', () => {
      // Moment will output a warning because of the deliberately bad arg
      spyOn(console, 'warn')
      expect(() => dateService.formatIso8601(moment('garbage'))).toThrowError('Not a valid date')
    })

    it('returns the expected ISO date as a String', () => {
      const s = '2017-07-16T14:01:02.123+01:00'
      const m = moment(s).utcOffset('+0100')
      const res = dateService.formatIso8601(m)
      expect(res).toBe(s)
    })
  })

  describe('#formatDayAndDate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatDayAndDate(date)).toBe('Friday 31 December')
    })
  })

  describe('#formatDateAndTime', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 12, 13)
      expect(dateService.formatDateAndTime(date)).toBe('31 December 2010 2:10pm')
    })
  })

  describe('#formatDateFromRequest', () => {
    it('should return a date correctly formatted', () => {
      const result1 = dateService.formatDateFromRequest(requestMock, 'adminStartDay', 'adminStartMonth', 'adminStartYear')
      const result2 = dateService.formatDateFromRequest(requestMock, 'checkStartDay', 'checkStartMonth', 'checkStartYear')
      const result3 = dateService.formatDateFromRequest(requestMock, 'checkEndDay', 'checkEndMonth', 'checkEndYear')
      expect(result1.toISOString()).toBe('2018-11-10T00:00:00.000Z')
      expect(result2.toISOString()).toBe('2018-12-09T00:00:00.000Z')
      expect(result3.toISOString()).toBe('2018-12-10T00:00:00.000Z')
    })
  })

  describe('#formatCheckPeriod', () => {
    it('should return a date correctly formatted', () => {
      const result = dateService.formatCheckPeriod(moment('2017-11-01'), moment('2017-11-20'))
      expect(result).toBe('1 Nov to 20 Nov 2017')
    })
  })

  describe('createUTCFromDayMonthYear', () => {
    it('creates a moment date object', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1).toBeTruthy()
    })
    it('sets the date of month', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.date()).toBe(30)
    })
    it('sets the month', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.format('M')).toBe('6')
    })
    it('sets the year', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.year()).toBe(2007)
    })
    it('sets the hours to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.hour()).toBe(0)
    })
    it('sets the minutes to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.minutes()).toBe(0)
    })
    it('sets the seconds to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.seconds()).toBe(0)
    })
    it('sets the milliseconds to zero', () => {
      const res1 = dateService.createUTCFromDayMonthYear(30, 6, 2007)
      expect(res1.milliseconds()).toBe(0)
    })
    it('creates a moment date object from strings', () => {
      const res1 = dateService.createUTCFromDayMonthYear('31', '7', '2008')
      expect(res1.toISOString()).toBe('2008-07-31T00:00:00.000Z')
    })
    it('returns null if given an invalid date', () => {
      const res1 = dateService.createUTCFromDayMonthYear(31, 6, 1999)
      expect(res1).toBeNull()
    })
    it('returns null when arguments are missing', () => {
      const res1 = dateService.createUTCFromDayMonthYear(undefined, undefined, undefined)
      expect(res1).toBeNull()
    })
    it('returns null when an argument are null', () => {
      const res1 = dateService.createUTCFromDayMonthYear(null, null, null)
      expect(res1).toBeNull()
    })
  })
  describe('createLocalTimeFromDayMonthYear', () => {
    it('creates a moment date object', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1).toBeTruthy()
    })
    it('sets the date of month', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.date()).toBe(30)
    })
    it('sets the month', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.format('M')).toBe('6')
    })
    it('sets the year', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.year()).toBe(2007)
    })
    it('sets the hours to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.hour()).toBe(0)
    })
    it('sets the minutes to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.minutes()).toBe(0)
    })
    it('sets the seconds to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.seconds()).toBe(0)
    })
    it('sets the milliseconds to zero', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(30, 6, 2007)
      expect(res1.milliseconds()).toBe(0)
    })
    it('returns null if given an invalid date', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(31, 6, 1999)
      expect(res1).toBeNull()
    })
    it('returns null when arguments are missing', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(undefined, undefined, undefined)
      expect(res1).toBeNull()
    })
    it('returns null when an argument are null', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(null, null, null)
      expect(res1).toBeNull()
    })
    it('returns null when the date is invalid', () => {
      const res1 = dateService.createLocalTimeFromDayMonthYear(99, 99, 99)
      expect(res1).toBeNull()
    })
  })
})
