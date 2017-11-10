'use strict'
const pupilService = require('../../services/pupil.service')

/* global describe, it, expect */

describe('pupil service', () => {
  describe('calculateScore', () => {
    it('returns undefined if results undefined', () => {
      const actual = pupilService.calculateScorePercentage(undefined)
      expect(actual).toBe(undefined)
    })

    it('returns error message if results do not contain marks', () => {
      const actual = pupilService.calculateScorePercentage({maxMarks: 10})
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns error message if results do not contain maxMarks', () => {
      const actual = pupilService.calculateScorePercentage({marks: 5})
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns error message if score out of range', () => {
      const results = {
        marks: 20,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns 100% when all answers are correct', () => {
      const results = {
        marks: 10,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(100)
    })

    it('returns 50% when half the answers are correct', () => {
      const results = {
        marks: 5,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(50)
    })

    it('returns 0% when no answers are correct', () => {
      const results = {
        marks: 0,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(0)
    })

    it('rounds to the nearest 1 decimal point when necessary', () => {
      const results = {
        marks: 7,
        maxMarks: 30
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(23.3)
    })
  })
})
