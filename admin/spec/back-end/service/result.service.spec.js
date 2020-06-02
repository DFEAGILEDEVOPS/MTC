'use strict'
/* global describe, it, expect spyOn fail */
const RA = require('ramda-adjunct')

const redisCacheService = require('../../../services/data-access/redis-cache.service')
const resultService = require('../../../services/result.service')

describe('result.service', () => {
  describe('getPupilResultData', () => {
    it('calls redisCacheService get when school id is provided', async () => {
      spyOn(redisCacheService, 'get').and.returnValue('[{}]')
      const schoolId = 2
      try {
        await resultService.getPupilResultData(schoolId)
      } catch (error) {
        fail()
      }
      expect(redisCacheService.get).toHaveBeenCalled()
    })
    it('throws an error if school id is not provided', async () => {
      spyOn(redisCacheService, 'get')
      const schoolId = undefined
      try {
        await resultService.getPupilResultData(schoolId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(redisCacheService.get).not.toHaveBeenCalled()
    })
    it('returns undefined if parsing the redis response fails', async () => {
      spyOn(redisCacheService, 'get')
      const schoolId = 1
      let result
      try {
        result = await resultService.getPupilResultData(schoolId)
      } catch (error) {
        fail()
      }
      expect(result).toBeUndefined()
    })
  })

  describe('createPupilData', () => {
    it('assigns a score to a pupil with a completed check', () => {
      const data = [
        { pupilId: 1, mark: 10, foreName: 'Joe', lastName: 'Test' }
      ]
      const result = resultService.createPupilData(data) // sut
      expect(RA.isArray(result)).toBe(true)
    })
  })

  describe('assignStatus', () => {
    const sut = resultService.assignStatus

    it('describes complete pupils with no status', () => {
      const pupil = { restartAvailable: false, currentCheckId: 1, checkComplete: true }
      const status = sut(pupil)
      expect(status).toBe('')
    })

    it('describes incomplete pupils with an incomplete status', () => {
      const pupil = { restartAvailable: false, currentCheckId: 2, checkComplete: false }
      const status = sut(pupil)
      expect(status).toBe('Incomplete')
    })

    it('describes pupils who did not take a check', () => {
      const pupil = { restartAvailable: false, currentCheckId: null, checkComplete: false, attendanceId: false }
      const status = sut(pupil)
      expect(status).toBe('Did not participate')
    })

    it('describes pupils who are marked as not attending', () => {
      const pupil = {
        restartAvailable: false,
        currentCheckId: null,
        checkComplete: false,
        attendanceReason: 'any of the reasons for not attending'
      }
      const status = sut(pupil)
      expect(status).toBe('any of the reasons for not attending')
    })
  })
}) // end result service
