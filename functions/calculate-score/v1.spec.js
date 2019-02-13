'use strict'

/* global describe expect it spyOn fail */

const moment = require('moment')

const scoreCalculationDataService = require('./score-calculation.data.service')
const checkWindowDataService = require('./check-window.data.service')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score: v1', () => {
  describe('process', () => {
    it('fetches the relevant check window for the calcuation period, fetches schools with scores submits them for school score and national score calculation', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, adminEndDate: moment.utc().add(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores').and.returnValue([{ 'school_id': 1, score: 0.22 }])
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      spyOn(scoreCalculationDataService, 'sqlInsertCheckWindowScore')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).toHaveBeenCalled()
    })
    it('calls sqlMarkCheckWindowAsComplete if check window admin end date has passed and check window is not flagged as complete', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, adminEndDate: moment.utc().subtract(1, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores').and.returnValue([{ 'school_id': 1, score: 0.22 }])
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      spyOn(scoreCalculationDataService, 'sqlInsertCheckWindowScore')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).toHaveBeenCalled()
    })
    it('returns before proceeding further if no check window is found for the calculation period', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores')
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      spyOn(scoreCalculationDataService, 'sqlInsertCheckWindowScore')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).not.toHaveBeenCalled()
    })
    it('returns before fetching schools with scores if the check window has complete flag set as true', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: true, adminEndDate: moment.utc().subtract(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores')
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      spyOn(scoreCalculationDataService, 'sqlInsertCheckWindowScore')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).not.toHaveBeenCalled()
    })
    it('throws an error before inserting when fetching schools format is wrong', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, adminEndDate: moment.utc().add(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores')
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      spyOn(scoreCalculationDataService, 'sqlInsertCheckWindowScore')
      try {
        await v1.process(context)
      } catch (error) {
        expect(error.message).toBe('calculate-score: no schools with scores found or not in valid format for check window id: 1')
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).not.toHaveBeenCalled()
    })
    it('returns before inserting if no schools with scores are fetched', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, adminEndDate: moment.utc().add(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores').and.returnValue([])
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      spyOn(scoreCalculationDataService, 'sqlInsertCheckWindowScore')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).not.toHaveBeenCalled()
    })
    it('throws an error if inserting data method throws', async () => {
      spyOn(checkWindowDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false, adminEndDate: moment.utc().add(5, 'days') })
      spyOn(checkWindowDataService, 'sqlMarkCheckWindowAsComplete')
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores').and.returnValue([{ 'school_id': 1, score: 0.22 }])
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores').and.returnValue(Promise.reject(new Error('error')))
      spyOn(scoreCalculationDataService, 'sqlInsertCheckWindowScore')
      try {
        await v1.process(context)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(checkWindowDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(checkWindowDataService.sqlMarkCheckWindowAsComplete).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertCheckWindowScore).not.toHaveBeenCalled()
    })
  })
})
