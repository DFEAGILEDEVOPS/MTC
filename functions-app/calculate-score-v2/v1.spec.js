'use strict'

/* global describe expect spyOn fail it */
const moment = require('moment')

const schoolScoresDataService = require('./schools-scores.data.service')
const checkWindowDataService = require('./check-window.data.service')
const schoolDataService = require('./school.data.service')
const pupilResultsDiagnosticCache = require('./pupil-results-diagnostic-cache.data.service')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score-v2: v1', () => {
  describe('process', () => {
    it('executes score calculation store procedure', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(schoolDataService, 'sqlFindSchoolIds').and.returnValue([1, 2, 3, 4])
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete')
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScoresStoreProcedure').and.returnValue({ id: 1 })
      spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolDataService.sqlFindSchoolIds).toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScoresStoreProcedure).toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlInsert).toHaveBeenCalledWith(1, '{"id":1}')
    })
    it('returns before proceeding further if no check window is found', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(schoolDataService, 'sqlFindSchoolIds')
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete')
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScoresStoreProcedure')
      spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolDataService.sqlFindSchoolIds).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).not.toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScoresStoreProcedure).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlInsert).not.toHaveBeenCalled()
    })
    it('returns before proceeding further if school ids are not found', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(schoolDataService, 'sqlFindSchoolIds')
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete')
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScoresStoreProcedure')
      spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolDataService.sqlFindSchoolIds).toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).not.toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScoresStoreProcedure).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlInsert).not.toHaveBeenCalled()
    })
    it('returns before proceeding further if deleting the cache table fails', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(schoolDataService, 'sqlFindSchoolIds').and.returnValue([1, 2, 3, 4])
      spyOn(pupilResultsDiagnosticCache, 'sqlDelete').and.returnValue(Promise.reject(new Error('error')))
      spyOn(schoolScoresDataService, 'sqlExecuteGetSchoolScoresStoreProcedure')
      spyOn(pupilResultsDiagnosticCache, 'sqlInsert')
      try {
        await v1.process(context)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolDataService.sqlFindSchoolIds).toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlDelete).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteGetSchoolScoresStoreProcedure).not.toHaveBeenCalled()
      expect(pupilResultsDiagnosticCache.sqlInsert).not.toHaveBeenCalled()
    })
  })
})
