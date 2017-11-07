'use strict'
const pupilService = require('../../services/pupil.service')
const pupilMock = require('../mocks/pupil')

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
  describe('requiresExtraFields', () => {
    it('returns showDoB property as true for pupils with same fullname', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      const pupils = pupilService.requiresExtraFields([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showDoB).toBeTruthy()
    })
    it('returns showDoB property as false for pupils with different fullname', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      pupil1.foreName = 'test'
      const pupils = pupilService.requiresExtraFields([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showDoB).toBeFalsy()
    })
    it('returns showMiddleNames property as true for pupils with same fullname and DoB', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      const pupils = pupilService.requiresExtraFields([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showMiddleNames).toBeTruthy()
    })
    it('returns showMiddleNames property as false for pupils with different fullname and Dob', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      pupil1.foreName = 'test'
      const pupils = pupilService.requiresExtraFields([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showMiddleNames).toBeFalsy()
    })
  })
})
