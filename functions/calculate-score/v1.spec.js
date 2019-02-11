'use strict'

/* global describe expect it spyOn fail */

const scoreCalculationDataService = require('./score-calculation.data.service')
const v1 = require('./v1')
const context = require('../mock-context')

describe('calculate-score: v1', () => {
  describe('process', () => {
    it('fetches the relevant check window for the calcuation period, fetches schools with scores and submits them for insertion', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false })
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores').and.returnValue([{ 'school_id': 1, score: 0.22 }])
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).toHaveBeenCalled()
    })
    it('returns before proceeding further if no check window is found for the calculation period', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({})
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores')
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
    })
    it('returns before fetching schools with scores if the check window has complete flag set as true', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: true })
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores')
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).not.toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
    })
    it('throws an error before inserting when fetching schools format is wrong', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false })
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores')
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      try {
        await v1.process(context)
      } catch (error) {
        expect(error.message).toBe('calculate-score: no schools with scores found or not in valid format for check window id: 1')
      }
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
    })
    it('returns before inserting if no schools with scores are fetched', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false })
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores').and.returnValue([])
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores')
      try {
        await v1.process(context)
      } catch (error) {
        fail()
      }
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).not.toHaveBeenCalled()
    })
    it('throws an error if inserting data method throws', async () => {
      spyOn(scoreCalculationDataService, 'sqlFindCalculationPeriodCheckWindow').and.returnValue({ id: 1, complete: false })
      spyOn(scoreCalculationDataService, 'sqlFindCheckWindowSchoolAverageScores').and.returnValue([{ 'school_id': 1, score: 0.22 }])
      spyOn(scoreCalculationDataService, 'sqlInsertSchoolScores').and.returnValue(Promise.reject(new Error('error')))
      try {
        await v1.process(context)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(scoreCalculationDataService.sqlFindCalculationPeriodCheckWindow).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlFindCheckWindowSchoolAverageScores).toHaveBeenCalled()
      expect(scoreCalculationDataService.sqlInsertSchoolScores).toHaveBeenCalled()
    })
  })
})
