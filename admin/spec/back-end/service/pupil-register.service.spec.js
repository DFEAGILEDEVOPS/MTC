'use strict'

/* global describe expect it */

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
    it('identifies "Logged In"', () => {
      const status = pupilRegisterService.getProcessStatus('LOGGED_IN', 'COL', null, null)
      expect(status).toBe('Logged In')
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
  })
})
