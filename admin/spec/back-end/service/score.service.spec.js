const scoreService = require('../../../services/score.service')
const checkDataService = require('../../../services/data-access/check.data.service')
const pupilMock = require('../mocks/pupil')
const checkWithResultsMock = require('../mocks/check-results')
const checkMock = require('../mocks/check')

describe('score.service', () => {
  describe('getScorePercentage', () => {
    test('returns the score in percentage value if the latest check has results', async () => {
      jest.spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').mockResolvedValue(checkWithResultsMock)
      const result = await scoreService.getScorePercentage(pupilMock._id)
      expect(result).toBe('50%')
    })
    test('returns not available if the latest check has no results', async () => {
      jest.spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').mockResolvedValue(checkMock)
      const result = await scoreService.getScorePercentage(pupilMock._id)
      expect(result).toBe('N/A')
    })
  })

  describe('calculateScore', () => {
    test('returns undefined if results undefined', () => {
      const actual = scoreService.calculateScorePercentage(undefined)
      expect(actual).toBe(undefined)
    })

    test('returns error message if results do not contain marks', () => {
      const actual = scoreService.calculateScorePercentage({ maxMarks: 10 })
      expect(actual).toBe('Error Calculating Score')
    })

    test('returns error message if results do not contain maxMarks', () => {
      const actual = scoreService.calculateScorePercentage({ marks: 5 })
      expect(actual).toBe('Error Calculating Score')
    })

    test('returns error message if score out of range', () => {
      const results = {
        marks: 20,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe('Error Calculating Score')
    })

    test('returns 100% when all answers are correct', () => {
      const results = {
        marks: 10,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(100)
    })

    test('returns 50% when half the answers are correct', () => {
      const results = {
        marks: 5,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(50)
    })

    test('returns 0% when no answers are correct', () => {
      const results = {
        marks: 0,
        maxMarks: 10
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(0)
    })

    test('rounds to the nearest 1 decimal point when necessary', () => {
      const results = {
        marks: 7,
        maxMarks: 30
      }
      const actual = scoreService.calculateScorePercentage(results)
      expect(actual).toBe(23.3)
    })
  })
})
