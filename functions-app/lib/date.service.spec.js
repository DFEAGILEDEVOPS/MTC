'use strict'
/* global describe, expect, it, spyOn */

const dateService = require('./date.service') // sut

const { isPlainObj, isFunction } = require('ramda-adjunct')
const moment = require('moment')

describe('date.service', () => {
  it('is defined', () => {
    expect(dateService).toBeDefined()
  })
  it('is an object', () => {
    expect(isPlainObj(dateService)).toBe(true)
  })

  describe('#convertIsoStringToMoment', () => {
    it('is a function', () => {
      expect(isFunction(dateService.convertIsoStringToMoment)).toBe(true)
    })
    it('returns a moment object for a valid date', () => {
      const m = dateService.convertIsoStringToMoment('2019-10-09T09:30:00.123Z')
      expect(moment.isMoment(m)).toBeTruthy()
    })
    it('returns undefined for an invalid date', () => {
      const m = dateService.convertIsoStringToMoment('2019-02-30T09:30:00.123Z')
      expect(moment.isMoment(m)).toBeFalse()
    })
    it('works until 2050', () => {
      const m = dateService.convertIsoStringToMoment('2050-02-23T09:30:00.123Z')
      expect(moment.isMoment(m)).toBeTruthy()
    })
    it('returns a UTC date', () => {
      const m = dateService.convertIsoStringToMoment('2050-02-23T09:30:00.123Z')
      expect(moment.isMoment(m)).toBeTruthy()
    })
    it('returns undefined if the Z is missing', () => {
      const m = dateService.convertIsoStringToMoment('2050-02-23T09:30:00.123')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Months are not zero padded', () => {
      const m = dateService.convertIsoStringToMoment('2019-5-23T09:30:00.123Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Days are not zero padded', () => {
      const m = dateService.convertIsoStringToMoment('2019-05-1T09:30:00.123Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Hours are not zero padded', () => {
      const m = dateService.convertIsoStringToMoment('2019-05-10T9:30:00.123Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Minutes are not zero padded', () => {
      const m = dateService.convertIsoStringToMoment('2019-05-10T09:3:00.123Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Seconds are not zero padded', () => {
      const m = dateService.convertIsoStringToMoment('2019-05-10T09:13:4.123Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Milliseconds are 2 digits', () => {
      const m = dateService.convertIsoStringToMoment('2019-05-10T09:13:14.12Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Milliseconds are 1 digits', () => {
      const m = dateService.convertIsoStringToMoment('2019-05-10T09:13:14.1Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if the Milliseconds are missing', () => {
      const m = dateService.convertIsoStringToMoment('2019-05-10T09:13:14Z')
      expect(m).toBeUndefined()
    })
    it('returns undefined if moment throws an error parsing', () => {
      spyOn(moment, 'utc').and.throwError('testing')
      const m = dateService.convertIsoStringToMoment('1970-01-01T00:00:59.999Z')
      expect(m).toBeUndefined()
    })
  })
})
