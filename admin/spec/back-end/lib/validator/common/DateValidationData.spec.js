/* global describe, it, expect */

const DateValidationData = require('../../../../../lib/validator/common/DateValidationData')

describe('DateValidationData', function () {
  describe('day', function () {
    it('returns the object with populated day', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.day('day')
      expect(result).toBe(NewDateValidationData)
      expect(result.day).toBe('day')
    })
    it('returns the object with populated month', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.month('month')
      expect(result).toBe(NewDateValidationData)
      expect(result.month).toBe('month')
    })
    it('returns the object with populated year', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.year('year')
      expect(result).toBe(NewDateValidationData)
      expect(result.year).toBe('year')
    })
    it('returns the object with populated dayHTMLAttributeId', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.dayHTMLAttributeId('dayHTMLAttributeId')
      expect(result).toBe(NewDateValidationData)
      expect(result.dayHTMLAttributeId).toBe('dayHTMLAttributeId')
    })
    it('returns the object with populated monthHTMLAttributeId', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.monthHTMLAttributeId('monthHTMLAttributeId')
      expect(result).toBe(NewDateValidationData)
      expect(result.monthHTMLAttributeId).toBe('monthHTMLAttributeId')
    })
    it('returns the object with populated yearHTMLAttributeId', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.yearHTMLAttributeId('yearHTMLAttributeId')
      expect(result).toBe(NewDateValidationData)
      expect(result.yearHTMLAttributeId).toBe('yearHTMLAttributeId')
    })
    it('returns the object with populated wrongDayMessage', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.wrongDayMessage('wrongDayMessage')
      expect(result).toBe(NewDateValidationData)
      expect(result.wrongDayMessage).toBe('wrongDayMessage')
    })
    it('returns the object with populated wrongMonthMessage', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.wrongMonthMessage('wrongMonthMessage')
      expect(result).toBe(NewDateValidationData)
      expect(result.wrongMonthMessage).toBe('wrongMonthMessage')
    })
    it('returns the object with populated wrongYearMessage', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.wrongYearMessage('wrongYearMessage')
      expect(result).toBe(NewDateValidationData)
      expect(result.wrongYearMessage).toBe('wrongYearMessage')
    })
    it('returns the object with populated dayInvalidChars', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.dayInvalidChars('dayInvalidChars')
      expect(result).toBe(NewDateValidationData)
      expect(result.dayInvalidChars).toBe('dayInvalidChars')
    })
    it('returns the object with populated monthInvalidChars', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.monthInvalidChars('monthInvalidChars')
      expect(result).toBe(NewDateValidationData)
      expect(result.monthInvalidChars).toBe('monthInvalidChars')
    })
    it('returns the object with populated yearInvalidChars', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.yearInvalidChars('yearInvalidChars')
      expect(result).toBe(NewDateValidationData)
      expect(result.yearInvalidChars).toBe('yearInvalidChars')
    })
    it('returns the object with populated dateInThePast', () => {
      const NewDateValidationData = new DateValidationData()
      const result = NewDateValidationData.dateInThePast('dateInThePast')
      expect(result).toBe(NewDateValidationData)
      expect(result.dateInThePast).toBe('dateInThePast')
    })
  })
})
