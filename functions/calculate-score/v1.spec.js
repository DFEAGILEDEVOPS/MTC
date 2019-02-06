'use strict'

/* global describe expect it spyOn */

const sqlUtil = require('../lib/sql-helper')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score: v1', () => {
  describe('process', () => {
    it('fetches the relevant check window for the calcuation period and calls the score calculation store procedure', async () => {
      spyOn(sqlUtil, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false })
      spyOn(sqlUtil, 'sqlExecuteScoreCalculationStoreProcedure')
      await v1.process(context)
      expect(sqlUtil.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(sqlUtil.sqlExecuteScoreCalculationStoreProcedure).toHaveBeenCalled()
    })
    it('returns before calling the store procedure if no check window is found for the calculation period', async () => {
      spyOn(sqlUtil, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(sqlUtil, 'sqlExecuteScoreCalculationStoreProcedure')
      await v1.process(context)
      expect(sqlUtil.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(sqlUtil.sqlExecuteScoreCalculationStoreProcedure).not.toHaveBeenCalled()
    })
    it('returns before calling the store procedure if the check window has complete flag set as true', async () => {
      spyOn(sqlUtil, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: true })
      spyOn(sqlUtil, 'sqlExecuteScoreCalculationStoreProcedure')
      await v1.process(context)
      expect(sqlUtil.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(sqlUtil.sqlExecuteScoreCalculationStoreProcedure).not.toHaveBeenCalled()
    })
  })
})
