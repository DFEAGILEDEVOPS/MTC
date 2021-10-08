'use strict'

/* global describe expect fail beforeEach test jest afterEach */
const logger = require('../../../services/log.service').getLogger()
const moment = require('moment')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const pupilStatusDataService = require('../../../services/data-access/pupil-status.data.service')
const pupilStatusService = require('../../../services/pupil-status.service')
const settingService = require('../../../services/setting.service')

describe('pupil-status.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#getProcessStatusV2', () => {
    test('it is a function', () => {
      expect(typeof pupilStatusService.getProcessStatusV2).toBe('function')
    })

    test('it throws an error if pinExpiresAt is an object', () => {
      expect(() => {
        pupilStatusService.getProcessStatusV2({
          pinExpiresAt: { not: 'a moment object' }
        })
      }).toThrow('pinExpiresAt must be null or a Moment.moment datetime')
    })

    test('it throws an error if pinExpiresAt is a number', () => {
      expect(() => {
        pupilStatusService.getProcessStatusV2({
          pinExpiresAt: 66
        })
      }).toThrow('pinExpiresAt must be null or a Moment.moment datetime')
    })

    test('does not throw if pinExpiresAt is null', () => {
      expect(() => {
        pupilStatusService.getProcessStatusV2({
          pinExpiresAt: null
        })
      }).not.toThrow()
    })

    test('it can detect a pupil not taking the check', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: 1,
        currentCheckId: null,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: null,
        reason: 'Just arrived with EAL'
      })
      expect(status).toBe('Just arrived with EAL')
    })

    test('it can detect a Not Started pupil', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: null,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().add(4, 'hours')
      })
      expect(status).toBe('Not started')
    })

    test('it can detect a PIN Generated pupil', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
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
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
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

    test('it can detect a pupil that has a check in processing phase', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: true,
        pupilLoginDate: moment(),
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: null
      })
      expect(status).toBe('Processing')
    })

    test('it can detect a pupil that has a check with error in processing', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: true,
        pupilLoginDate: moment(),
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: null,
        processingFailed: true
      })
      expect(status).toBe('Error in processing')
    })

    test('it can detect a Complete pupil', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
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
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: null,
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

    test('it can detect an Incomplete check', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: moment().subtract(31, 'minutes'),
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().add(3, 'hours')
      })
      expect(status).toBe('Incomplete')
    })

    test('it can detect a pupil was allocated a check that then expired', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        restartAvailable: false,
        checkComplete: false,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: false,
        pinExpiresAt: moment().subtract(1, 'minutes')
      })
      expect(status).toBe('Not started')
    })

    test('a test that does not matches anything gets N/A', () => {
      // prevent an error being displayed in the console
      jest.spyOn(logger, 'error').mockImplementation()
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
        restartAvailable: false,
        checkComplete: true,
        checkReceived: false,
        pupilLoginDate: null,
        notReceivedExpiryInMinutes: 30,
        pupilCheckComplete: true,
        pinExpiresAt: moment().subtract(1, 'minutes')
      })
      expect(status).toBe('N/A')
      expect(logger.error).toHaveBeenCalled()
    })

    test('it detects a restart that was allocated a new check that then expired', () => {
      const status = pupilStatusService.getProcessStatusV2({
        attendanceId: null,
        currentCheckId: 1,
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
      expect(status).toBe('Not started')
    })
  })

  describe('#getPupilStatusData', () => {
    beforeEach(() => {
      jest.spyOn(settingService, 'get').mockResolvedValue({ checkTimeLimit: 30 })
      jest.spyOn(pupilStatusDataService, 'sqlFindPupilsFullStatus').mockResolvedValue([{ urlSlug: 'urlSlug' }])
      jest.spyOn(pupilStatusService, 'addStatus').mockImplementation()
      jest.spyOn(pupilIdentificationFlagService, 'sortAndAddIdentificationFlags').mockImplementation()
    })

    test('throws an error if no school password is provided', async () => {
      try {
        await pupilStatusService.getPupilStatusData(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id not found in session')
      }
    })

    test('calls the settingService get if school is provided', async () => {
      await pupilStatusService.getPupilStatusData(42)
      expect(settingService.get).toHaveBeenCalled()
    })

    test('calls the pupilStatusDataService sqlFindPupilsFullStatus if school is provided', async () => {
      await pupilStatusService.getPupilStatusData(42)
      expect(pupilStatusDataService.sqlFindPupilsFullStatus).toHaveBeenCalled()
    })

    test('calls the pupilStatusService addStatus if school is provided', async () => {
      await pupilStatusService.getPupilStatusData(42)
      expect(pupilStatusService.addStatus).toHaveBeenCalled()
    })

    test('calls the pupilIdentificationFlagService sortAndAddIdentificationFlags if school is provided', async () => {
      await pupilStatusService.getPupilStatusData(42)
      expect(pupilIdentificationFlagService.sortAndAddIdentificationFlags).toHaveBeenCalled()
    })

    test('calls the tableSorting applySorting if school is provided', async () => {
      await pupilStatusService.getPupilStatusData(42)
    })
  })
})
