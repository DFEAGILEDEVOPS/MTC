'use strict'

/* global describe expect spyOn fail it */
const moment = require('moment')

const config = require('../config')
const schoolScoresDataService = require('./schools-scores.data.service')
const checkWindowDataService = require('./check-window.data.service')
const pupilResultsDiagnosticCache = require('./pupil-results-diagnostic-cache.data.service')
const redisCacheService = require('../lib/redis-cache.service')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score-v2: v1', () => {
  describe('process', () => {
    it('executes get school scores store procedure and stores data in sql cache and redis cache', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(schoolScoresDataService, 'sqlFindSchoolIds').and.returnValue([1, 2, 3, 4])
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete')
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScores').and.returnValue([{ id: 1 }])
      const sqlInsertSpy = spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      const redisSetSpy = spyOn(redisCacheService, 'set')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlFindSchoolIds).toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScores).toHaveBeenCalled()
      expect(sqlInsertSpy.calls.first().args[1].generatedAt).toBeDefined()
      expect(sqlInsertSpy.calls.first().args[1].pupilResultData).toEqual([{ id: 1 }])
      expect(redisSetSpy.calls.first().args[0]).toEqual('result:1')
      expect(redisSetSpy.calls.first().args[1].generatedAt).toBeDefined()
      expect(redisSetSpy.calls.first().args[1].pupilResultData).toEqual([{ id: 1 }])
      expect(redisSetSpy.calls.first().args[2]).toEqual({ expires: config.REDIS_RESULTS_EXPIRY_IN_SECONDS })
    })
    it('returns before proceeding further if no check window is found', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(schoolScoresDataService, 'sqlFindSchoolIds')
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete')
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScores')
      spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlFindSchoolIds).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).not.toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScores).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlInsert).not.toHaveBeenCalled()
    })
    it('returns before proceeding further if school ids are not found', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(schoolScoresDataService, 'sqlFindSchoolIds')
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete')
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScores')
      spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlFindSchoolIds).toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).not.toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScores).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlInsert).not.toHaveBeenCalled()
    })
    it('returns before proceeding further if deleting the cache table fails', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(schoolScoresDataService, 'sqlFindSchoolIds').and.returnValue([1, 2, 3, 4])
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete').and.returnValue(Promise.reject(new Error('error')))
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScores')
      spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      try {
        await v1.process(context)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlFindSchoolIds).toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScores).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlInsert).not.toHaveBeenCalled()
    })
  })
})
