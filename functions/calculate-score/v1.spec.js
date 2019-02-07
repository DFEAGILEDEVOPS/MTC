'use strict'

/* global describe expect it spyOn */

const scoreCalculationDataService = require('./score-calculation.data.service')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score: v1', () => {
  describe('process', () => {
    it('fetches the relevant check window for the calcuation period and calls the score calculation store procedure', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false })
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure')
      await v1.process(context)
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).toHaveBeenCalled()
    })
    it('returns before calling the store procedure if no check window is found for the calculation period', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure')
      await v1.process(context)
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).not.toHaveBeenCalled()
    })
    it('returns before calling the store procedure if the check window has complete flag set as true', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: true })
      spyOn(scoreCalculationDataService, 'sqlExecuteScoreCalculationStoreProcedure')
      await v1.process(context)
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlExecuteScoreCalculationStoreProcedure).not.toHaveBeenCalled()
    })
  })
})
