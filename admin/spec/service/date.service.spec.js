'use strict'
/* global describe it expect */

const dateService = require('../../services/date.service')
const requestMock = require('../mocks/dates-req-mock')
const moment = require('moment')

function invalidInputTests (method) {
  it('returns an empty string if the parameter is an empty string', () => {
    expect(dateService[method]('')).toBe('')
  })

  it('returns an empty string if the parameter is missing', () => {
    expect(dateService[method]()).toBe('')
  })

  it('returns an empty string if the parameter is null', () => {
    expect(dateService[method](null)).toBe('')
  })

  it('returns an empty string if the date is invalid', () => {
    expect(dateService[method]('rotten-input')).toBe('')
  })
}

describe('date service', () => {
  describe('#formatFullGdsDate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
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

  describe('#formatDayAndDate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatDayAndDate(date)).toBe('Friday 31 December')
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
})
