'use strict'

/* global describe expect jest test beforeEach */

const restartDataService = require('../../../services/data-access/restart-v2.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const moment = require('moment')
const uuid = require('uuid')
const R = require('ramda')

// sut
const restartV2Service = require('../../../services/restart-v2.service')
const sut = restartV2Service

describe('restart-v2.service', () => {
  describe('#getPupilsEligibleForRestart', () => {
    test('calls the restart data service to find the pupils', async () => {
      const schoolId = 42
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').mockResolvedValue([])
      await restartV2Service.getPupilsEligibleForRestart(schoolId)
      expect(restartDataService.sqlFindPupilsEligibleForRestart).toHaveBeenCalledTimes(1)
    })

    test('makes a call to the pupil identification service to get display information for the GUI', async () => {
      const schoolId = 42
      jest.spyOn(pupilIdentificationFlagService, 'sortAndAddIdentificationFlags')
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').mockResolvedValue([])
      await restartV2Service.getPupilsEligibleForRestart(schoolId)
      expect(pupilIdentificationFlagService.sortAndAddIdentificationFlags).toHaveBeenCalledTimes(1)
    })
  })

  describe('#getRestartsForSchool', () => {
    const mock = {
      id: 1,
      pupilId: 2,
      restartReasonCode: 'ITI',
      reason: 'IT issues',
      foreName: 'Forename',
      lastName: 'Lastname',
      middleNames: '',
      dateOfBirth: moment().subtract(9, 'years'),
      urlSlug: uuid.NIL,
      restartCheckAllocation: 3, // the new check id generated from the restart
      totalCheckCount: 2, // the total number of checks _taken_ for the pupil
      restartCheckId: 3, // the new check id generated from the restart
      restartCheckPupilLoginDate: null, // the pupilLoginDate against the restarted check
      restartCheckReceived: false, // the received flag against the restarted check
      restartCheckComplete: false, // the complete flag against the restarted check
      isDiscretionaryRestartAvailable: false // set to yes to indicate an STA-ADMIN permission has been given to allow an additional restart, overriding the maximum number of restarts allowed.
    }
    let sample

    beforeEach(() => {
      sample = R.clone(mock)
    })

    test('it allows a restart to be deleted when it has not had a check raised against it', async () => {
      sample.restartCheckId = null
      sample.restartCheckPupilLoginDate = null
      sample.restartCheckReceived = false
      sample.restartCheckComplete = false
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].status).toBe('Remove restart')
    })

    test('it does not allow a restart to be deleted when it has a check raised against it and the pupil has not logged in', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = null
      sample.restartCheckReceived = false
      sample.restartCheckComplete = false
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('it does not allow a restart to be deleted when it has a check raised against it and the pupil has logged in', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = moment()
      sample.restartCheckReceived = false
      sample.restartCheckComplete = false
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('it informs the user when the number of restarts has reached the maximum limit', async () => {
      sample.totalCheckCount = 3
      sample.restartCheckReceived = true // Show the previous restart was received...
      sample.restartCheckComplete = true // ...and completed
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].status).toBe('Maximum number of restarts taken')
    })

    test('it informs the user when the restart has been received', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = moment()
      sample.restartCheckReceived = true
      sample.restartCheckComplete = false
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('it informs the user when the restart has been completed', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = moment()
      sample.restartCheckReceived = true
      sample.restartCheckComplete = true
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('the totalCheckCount is set to 0 when the totalCheckCount is null', async () => {
      sample.totalCheckCount = null
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].totalCheckCount).toBe(0)
    })

    test('the totalCheckCount is set to 0 when the totalCheckCount is undefined', async () => {
      sample.totalCheckCount = undefined
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].totalCheckCount).toBe(0)
    })

    test('it subtly informs the user when a discretionary restart has been allowed', async () => {
      // Set up so that the user has already had a check and 2 restarts. e.g. the full complement of normally allowed checks
      sample.restartCheckReceived = true
      sample.restartCheckComplete = true
      sample.totalCheckCount = 3
      // and apply a discretionary restart
      sample.isDiscretionaryRestartAvailable = true
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await sut.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })
  })
})
