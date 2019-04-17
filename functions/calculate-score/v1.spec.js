'use strict'

/* global describe expect spyOn fail it */

const moment = require('moment')

const scoreCalculationDataService = require('./score-calculation.data.service')
const checkWindowDataService = require('./check-window.data.service')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score: v1', () => {
  describe('process', () => {
    it('fetches the relevant non-complete check window for the calculation period and executes score calculation store procedure', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).toHaveBeenCalled()
    })
    it('calls sqlMarkCheckWindowAsComplete if the current date is a day after check window live check end date and check window is not flagged as complete', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().subtract(1, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure')

      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).toHaveBeenCalled()
    })
    it('returns before proceeding further if no check window is found for the calculation period', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).not.toHaveBeenCalled()
    })
    it('returns before it executes score calculation store procedure if the check window has complete flag set as true', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: true, checkEndDate: moment.utc().subtract(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).not.toHaveBeenCalled()
    })
    it('throws an error if score calculation store procedure throws', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, checkEndDate: moment.utc().add(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure').and.returnValue(Promise.reject(new Error('error')))
      try {
        await v1.process(context)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).toHaveBeenCalled()
    })
  })
})
