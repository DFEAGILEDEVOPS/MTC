'use strict'
/* global describe, it, expect, spyOn */

const dateService = require('../service/date.service')
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
})
