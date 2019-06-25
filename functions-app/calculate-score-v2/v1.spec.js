'use strict'

/* global describe expect spyOn fail it */
const moment = require('moment')

const schoolScoresDataService = require('./schools-scores.data.service')
const checkWindowDataService = require('./check-window.data.service')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score-v2: v1', () => {
  describe('process', () => {
    it('executes score calculation store procedure', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(schoolScoresDataService, 'sqlExecuteStoreSchoolScoresStoreProcedure')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteStoreSchoolScoresStoreProcedure).toHaveBeenCalled()
    })
    it('returns before proceeding further if no check window is found', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(schoolScoresDataService, 'sqlExecuteStoreSchoolScoresStoreProcedure')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(schoolScoresDataService.sqlExecuteStoreSchoolScoresStoreProcedure).not.toHaveBeenCalled()
    })
  })
})
