'use strict'
/* global describe, it, expect spyOn fail */

const resultDataService = require('../../../services/data-access/result.data.service')
const schoolScoreDataService = require('../../../services/data-access/school-score.data.service')
const resultService = require('../../../services/result.service')

describe('result.service', () => {
  describe('getPupilsWithResults', () => {
    it('calls sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId when school id and check window id are provided', async () => {
      spyOn(resultDataService, 'sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = 2
      try {
        await resultService.getPupilsWithResults(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId).toHaveBeenCalled()
    })
    it('throws an error if check window id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId')
      const checkWindowId = undefined
      const schoolId = 2
      try {
        await resultService.getPupilsWithResults(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('check window id not found')
      }
      expect(resultDataService.sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
    it('throws an error if school id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = undefined
      try {
        await resultService.getPupilsWithResults(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(resultDataService.sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
  })
  describe('getSchoolScore', () => {
    it('calls sqlFindSchoolScoreBySchoolIdAndCheckWindowId when school id and check window id are provided and returns a valid score number', async () => {
      spyOn(schoolScoreDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1, score: 6 })
      const checkWindowId = 1
      const schoolId = 2
      let schoolScore
      try {
        schoolScore = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(schoolScore).toBe(6)
    })
    it('throws an error if check window id is not provided', async () => {
      spyOn(schoolScoreDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = undefined
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('check window id not found')
      }
      expect(schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
    it('throws an error if school id is not provided', async () => {
      spyOn(schoolScoreDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = undefined
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
    it('throws an error if sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId returns an error', async () => {
      spyOn(schoolScoreDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue(Promise.reject(new Error('error')))
      const checkWindowId = 1
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
    })
    it('throws an error if sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId returns an empty object', async () => {
      spyOn(schoolScoreDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe(`no school score record is found or no score is set for school id: ${schoolId} and check window id: ${checkWindowId}`)
      }
      expect(schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
    })
    it('throws an error if sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId returns no score property', async () => {
      spyOn(schoolScoreDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1 })
      const checkWindowId = 1
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe(`no school score record is found or no score is set for school id: ${schoolId} and check window id: ${checkWindowId}`)
      }
      expect(schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
    })
  })
})
