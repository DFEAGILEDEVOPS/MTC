const scoreService = require('../../../services/score.service')
const checkDataService = require('../../../services/data-access/check.data.service')
const pupilMock = require('../mocks/pupil')
const checkWithResultsMock = require('../mocks/check-results')
const checkMock = require('../mocks/check')

/* global describe, it, expect, spyOn */

describe('score.service', () => {
  describe('getScorePercentage', () => {
    it('returns the score in percentage value if the latest check has results', async () => {
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue(checkWithResultsMock)
      const result = await scoreService.getScorePercentage(pupilMock._id)
      expect(result).toBe('50%')
    })
    it('returns not available if the latest check has no results', async () => {
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue(checkMock)
      const result = await scoreService.getScorePercentage(pupilMock._id)
      expect(result).toBe('N/A')
    })
  })

  describe('calculateScore', () => {
    it('returns undefined if results undefined', () => {
      const actual = scoreService.calculateScorePercentage(undefined)
      expect(actual).toBe(undefined)
    })

    it('returns error message if results do not contain marks', () => {
      const actual = scoreService.calculateScorePercentage({ maxMarks: 10 })
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns error message if results do not contain maxMarks', () => {
      const actual = scoreService.calculateScorePercentage({ marks: 5 })
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns error message if score out of range', () => {
      const results = {
        marks: 20,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns 100% when all answers are correct', () => {
      const results = {
        marks: 10,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(100)
    })

    it('returns 50% when half the answers are correct', () => {
      const results = {
        marks: 5,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(50)
    })

    it('returns 0% when no answers are correct', () => {
      const results = {
        marks: 0,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(0)
    })

    it('rounds to the nearest 1 decimal point when necessary', () => {
      const results = {
        marks: 7,
        maxMarks: 30
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(23.3)
    })
  })
})
