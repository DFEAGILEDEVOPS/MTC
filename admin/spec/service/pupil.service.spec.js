'use strict'

const R = require('ramda')
const proxyquire = require('proxyquire').noCallThru()

const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

/* global describe, it, expect, spyOn */

describe('pupil service', () => {
  const pupilMockPromise = () => {
    const newPupil = R.clone(pupilMock)
    const newSchool = R.clone(schoolMock)
    newPupil.school = newSchool
    return Promise.resolve(newPupil)
  }

  function setupService (pupilDataService) {
    return proxyquire('../../services/pupil.service', {
      './data-access/pupil.data.service': pupilDataService
    })
  }

  describe('#fetchOnePupil', () => {
    it('it makes a call to the pupilDataService', async () => {
      spyOn(pupilDataService, 'findOne').and.returnValue(pupilMockPromise())
      const service = setupService(pupilDataService)
      await service.fetchOnePupil('arg1', 'arg2')
      expect(pupilDataService.findOne).toHaveBeenCalledWith({_id: 'arg1', school: 'arg2'})
    })
  })

  describe('#fetchMultiplePupils', () => {
    it('it makes a call to the pupilDataService for each pupil', async () => {
      spyOn(pupilDataService, 'findOne').and.returnValue(pupilMockPromise())
      const service = setupService(pupilDataService)
      const res = await service.fetchMultiplePupils([1, 2, 3, 4, 5])
      expect(pupilDataService.findOne).toHaveBeenCalledTimes(5)
      expect(res.length).toBe(5)
    })
  })

  describe('calculateScore', () => {
    const pupilService = require('../../services/pupil.service')

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
