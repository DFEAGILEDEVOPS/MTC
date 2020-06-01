'use strict'
/* global describe, it, expect spyOn fail */
const RA = require('ramda-adjunct')

const resultDataService = require('../../../services/data-access/result.data.service')
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

  describe('getSchoolScore', () => {
    it('calls sqlFindSchoolScoreBySchoolIdAndCheckWindowId when school id and check window id are provided and returns a valid score number', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1, score: 6 })
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toEqual({ id: 1, score: 6 })
    })
    it('returns 0 as school score', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1, score: 0 })
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toEqual({ id: 1, score: 0 })
    })
    it('throws an error if check window id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = undefined
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('check window id not found')
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
    it('throws an error if school id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = undefined
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
    it('throws an error if sqlFindSchoolScoreBySchoolIdAndCheckWindowId returns an error', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue(Promise.reject(new Error('error')))
      const checkWindowId = 1
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
    })
    it('returns if sqlFindSchoolScoreBySchoolIdAndCheckWindowId returns undefined or empty object', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toBeUndefined()
    })
    it('does not return if sqlFindResultsBySchool returns no score property', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1 })
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toEqual({ id: 1 })
    })
  })

  describe('assignResultStatuses', () => {
    it('returns incomplete status if check status is not received and pupil status is started', () => {
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: 'dateOfBirth',
        mark: null,
        reason: '',
        group_id: 1,
        checkStatusCode: 'NTR',
        pupilStatusCode: 'STARTED'
      }]
      const pupilData = resultService.assignResultStatuses(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: 'dateOfBirth',
        mark: null,
        reason: '',
        group_id: 1,
        checkStatusCode: 'NTR',
        pupilStatusCode: 'STARTED',
        statusInformation: 'Incomplete'
      }])
    })
    it('returns did not participate if pupil status code is unallocated and no check status code is provided', () => {
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: 'dateOfBirth',
        mark: null,
        reason: '',
        group_id: 1,
        checkStatusCode: null,
        pupilStatusCode: 'UNALLOC'
      }]
      const pupilData = resultService.assignResultStatuses(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: 'dateOfBirth',
        mark: null,
        reason: '',
        group_id: 1,
        checkStatusCode: null,
        pupilStatusCode: 'UNALLOC',
        statusInformation: 'Did not participate'
      }])
    })
    it('returns did not attempt the restart if pupil status code is unallocated and check status is CMP', () => {
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: 'dateOfBirth',
        mark: '',
        reason: '',
        group_id: 1,
        checkStatusCode: 'CMP',
        pupilStatusCode: 'UNALLOC',
        pupilRestartId: 1,
        pupilRestartCheckId: null
      }]
      const pupilData = resultService.assignResultStatuses(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: 'dateOfBirth',
        mark: '',
        reason: '',
        group_id: 1,
        checkStatusCode: 'CMP',
        pupilStatusCode: 'UNALLOC',
        pupilRestartId: 1,
        pupilRestartCheckId: null,
        statusInformation: 'Did not attempt the restart'
      }])
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
