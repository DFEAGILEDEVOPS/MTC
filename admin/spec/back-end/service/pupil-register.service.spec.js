'use strict'

/* global describe expect it beforeEach spyOn fail */

const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const pupilRegisterDataService = require('../../../services/data-access/pupil-register.data.service')
const pupilRegisterService = require('../../../services/pupil-register.service')

describe('pupil-register.service', () => {
  describe('#getProcessStatus', () => {
    it('identifies "Not Started"', () => {
      const status = pupilRegisterService.getProcessStatus('UNALLOC', null, null, null)
      expect(status).toBe('Not started')
    })
    it('identifies "PIN generated"', () => {
      const status = pupilRegisterService.getProcessStatus('ALLOC', 'NEW', null, null)
      expect(status).toBe('PIN generated')
    })
    it('identifies "Logged in"', () => {
      const status = pupilRegisterService.getProcessStatus('LOGGED_IN', 'COL', null, null)
      expect(status).toBe('Logged in')
    })
    it('identifies "Check started"', () => {
      const status = pupilRegisterService.getProcessStatus('STARTED', 'STD', null, null)
      expect(status).toBe('Check started')
    })
    it('identifies "Incomplete"', () => {
      const status = pupilRegisterService.getProcessStatus('STARTED', 'NTR', null, null)
      expect(status).toBe('Incomplete')
    })
    it('identifies "Not taking the Check"', () => {
      const status = pupilRegisterService.getProcessStatus('NOT_TAKING', null, null, null)
      expect(status).toBe('Not taking the Check')
    })
    it('identifies "Complete"', () => {
      const status = pupilRegisterService.getProcessStatus('COMPLETED', 'CMP', null, null)
      expect(status).toBe('Complete')
    })
    it('identifies "Restart"', () => {
      const status = pupilRegisterService.getProcessStatus('UNALLOC', null, 1, null)
      expect(status).toBe('Restart')
    })
    it('blanks it out if unknown', () => {
      const status = pupilRegisterService.getProcessStatus('KJSDHFOHDF', null, null, null)
      expect(status).toBe('')
    })
  })

  describe('#getPupilRegister', () => {
    beforeEach(() => {
      spyOn(pupilRegisterService, 'getPupilRegisterViewData')
    })
    it('throws an error if no school password is provided', async () => {
      try {
        await pupilRegisterService.getPupilRegister(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id not found in session')
      }
    })
    it('calls the getPupilRegisterViewData if school is provided', async () => {
      await pupilRegisterService.getPupilRegister(42)
      expect(pupilRegisterService.getPupilRegisterViewData).toHaveBeenCalled()
    })
  })

  describe('#getPupilRegisterViewData', () => {
    beforeEach(() => {
      spyOn(pupilRegisterDataService, 'getPupilRegister').and.returnValue([])
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
    })

    it('calls the pupil register data service to get the raw data', async () => {
      await pupilRegisterService.getPupilRegisterViewData(42)
      expect(pupilRegisterDataService.getPupilRegister).toHaveBeenCalled()
    })
    it('calls the pupil register identification flag service to get the view data based on raw', async () => {
      await pupilRegisterService.getPupilRegisterViewData(42)
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalled()
    })
  })

  describe('#hasIncompleteChecks', () => {
    it('returns true if incomplete checks are found', async () => {
      spyOn(pupilRegisterDataService, 'getIncompleteChecks').and.returnValue([{ urlSlug: 1 }])
      const result = await pupilRegisterService.hasIncompleteChecks(42)
      expect(result).toBeTruthy()
    })
    it('returns false if incomplete checks are not found', async () => {
      spyOn(pupilRegisterDataService, 'getIncompleteChecks').and.returnValue([])
      const result = await pupilRegisterService.hasIncompleteChecks(42)
      expect(result).toBeFalsy()
    })
  })
})
