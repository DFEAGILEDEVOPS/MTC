'use strict'
/* global describe it expect */

const dateService = require('../../services/date.service')

describe('date service', () => {
  describe('#formatFullGDSdate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatFullGdsDate(date)).toBe('31 December 2010')
    })

    it('returns an empty string if the parameter is an empty string', () => {
      expect(dateService.formatFullGdsDate('')).toBe('')
    })

    it('returns an empty string if the parameter is missing', () => {
      expect(dateService.formatFullGdsDate()).toBe('')
    })

    it('returns an empty string if the parameter is null', () => {
      expect(dateService.formatFullGdsDate(null)).toBe('')
    })

    it('returns an empty string if the date is invalid', () => {
      expect(dateService.formatFullGdsDate('rotten-input')).toBe('')
    })
  })

  describe('#formatShortGDSdate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatShortGdsDate(date)).toBe('31 Dec 2010')
    })

    it('returns an empty string if the parameter is an empty string', () => {
      expect(dateService.formatShortGdsDate('')).toBe('')
    })

    it('returns an empty string if the parameter is missing', () => {
      expect(dateService.formatShortGdsDate()).toBe('')
    })

    it('returns an empty string if the parameter is null', () => {
      expect(dateService.formatShortGdsDate(null)).toBe('')
    })

    it('returns an empty string if the date is invalid', () => {
      expect(dateService.formatShortGdsDate('rotten-input')).toBe('')
    })
  })

  describe('#formatUKDate', () => {
    it('correctly formats a date', () => {
      const date = new Date(2010, 11, 31, 14, 10, 0, 0)
      expect(dateService.formatUKDate(date)).toBe('31/12/2010')
    })

    it('returns an empty string if the parameter is an empty string', () => {
      expect(dateService.formatUKDate('')).toBe('')
    })

    it('returns an empty string if the parameter is missing', () => {
      expect(dateService.formatUKDate()).toBe('')
    })

    it('returns an empty string if the parameter is null', () => {
      expect(dateService.formatUKDate(null)).toBe('')
    })

    it('returns an empty string if the date is invalid', () => {
      expect(dateService.formatUKDate('rotten-input')).toBe('')
    })
  })
})
