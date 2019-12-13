'use strict'

/* global describe expect it beforeEach spyOn fail test */
const moment = require('moment')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const pupilRegisterDataService = require('../../../services/data-access/pupil-register.data.service')
const pupilRegisterService = require('../../../services/pupil-register.service')
const settingService = require('../../../services/setting.service')

describe('pupil-register.service', () => {
  beforeEach(() => {
    spyOn(settingService, 'get').and.returnValue(Promise.resolve({ checkTimeLimit: 30 }))
  })

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

  describe('#getProcessStatusV2', () => {
    test('it is a function', () => {
      expect(typeof pupilRegisterService.getProcessStatusV2).toBe('function')
    })

    test('it throws an error if pinExpiresAt is an object', () => {
      expect(() => {
        pupilRegisterService.getProcessStatusV2({
          pinExpiresAt: { not: 'a moment object' }
        })
      }).toThrow('pinExpiresAt must be null or a Moment.moment datetime')
    })

    test('it throws an error if pinExpiresAt is a number', () => {
      expect(() => {
        pupilRegisterService.getProcessStatusV2({
          pinExpiresAt: 66
        })
      }).toThrow('pinExpiresAt must be null or a Moment.moment datetime')
    })

    test('does not throw if pinExpiresAt is null', () => {
      expect(() => {
        pupilRegisterService.getProcessStatusV2({
          pinExpiresAt: null
        })
      }).not.toThrow()
    })

    test('it can detect a pupil not taking the check', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: 1,
        currentCheckId: null,
        checkStatusCode: null,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: null
      })
      expect(status).toBe('Not taking the check')
    })

    test('it can detect a Not Started pupil', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: null,
        checkStatusCode: null,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().add(4, 'hours')
      })
      expect(status).toBe('Not Started')
    })

    test('it can detect a PIN Generated pupil', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        checkStatusCode: 'NEW',
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().add(7, 'hours')
      })
      expect(status).toBe('PIN generated')
    })

    test('it can detect a Logged In pupil', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        checkStatusCode: 'COL',
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: moment(),
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().add(4, 'hours')
      })
      expect(status).toBe('Logged in')
    })

    test('it can detect a Complete pupil', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        checkStatusCode: 'CMP',
        restartAvailable: false,
        checkComplete: true,
        checkReceived: true,
        pupilLoginDate: moment(),
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: true,
        pinExpiresAt: null
      })
      expect(status).toBe('Complete')
    })

    test('it can detect a restart', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: null,
        checkStatusCode: null,
        restartAvailable: true,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: moment(),
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: null
      })
      expect(status).toBe('Restart')
    })

    test('it can detect a not received check', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        checkStatusCode: 'COL',
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: moment().subtract(31, 'minutes'),
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().add(3, 'hours')
      })
      expect(status).toBe('Not received')
    })

    test('it can detect a pupil was allocated a check that then expired', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        checkStatusCode: 'NEW',
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().subtract(1, 'minutes')
      })
      expect(status).toBe('Not Started')
    })

    test('a test that does not matches anything gets N/A', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        checkStatusCode: 'VOD',
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().subtract(1, 'minutes')
      })
      expect(status).toBe('N/A')
    })

    test('it detects a restart that was allocated a new check that then expired', () => {
      const status = pupilRegisterService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        checkStatusCode: 'NEW',
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().subtract(3, 'minutes')
      })
      // Ideally this would show 'Restart' as it would show the teacher that the pupil was a Restart case.  However,
      // this would need the 'restartAvailable' flag to be true, or alternatively an 'isRestart' or a 'checkCount' field
      // on the restart e.g. Restart = checkCount > 1
      expect(status).toBe('Not Started')
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
