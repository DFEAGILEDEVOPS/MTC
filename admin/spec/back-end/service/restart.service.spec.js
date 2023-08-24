'use strict'

/* global beforeEach, afterEach, describe, test, expect, jest */

const prepareCheckService = require('../../../services/prepare-check.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilRestartDataService = require('../../../services/data-access/pupil-restart.data.service')
const restartDataService = require('../../../services/data-access/restart.data.service')
const restartService = require('../../../services/restart.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen.service/pupil-frozen.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const moment = require('moment')
const uuid = require('uuid')
const R = require('ramda')

const pupilMock = require('../mocks/pupil')

describe('restart.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('restart', () => {
    test('throws an error if the schoolId is not provided', async () => {
      await expect(restartService.restart([1, 2], 'Test', '', '', '', '59c38bcf3cd57f97b7da2002', undefined)).rejects.toThrow('Missing parameter: `schoolId`')
    })

    test('it should call restartTransactionForPupils if the pupil can be restarted', async () => {
      const schoolId = 42
      // allow `incomingPupilValidation()` to match
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestartByPupilId').mockResolvedValue([{ id: 1 }, { id: 2 }])
      jest.spyOn(restartDataService, 'getLiveCheckDataByPupilId').mockResolvedValue(
        [
          {
            checkId: 1,
            pupilId: 1,
            pupilPin: 1234,
            schoolPin: 'abc12def'
          },
          {
            checkId: 2,
            pupilId: 2,
            pupilPin: 5678,
            schoolPin: 'abc12def'
          }
        ]
      )
      jest.spyOn(restartDataService, 'restartTransactionForPupils').mockResolvedValue(
        [
          { id: 1, urlSlug: 'abc-def' },
          { id: 2, urlSlug: 'def-hij' }
        ]
      )
      jest.spyOn(prepareCheckService, 'dropChecksFromCache').mockImplementation()
      await expect(restartService.restart([1, 2], 'IT issues', '', '', '', '59c38bcf3cd57f97b7da2002', schoolId))
        .resolves
        .toHaveLength(2)
      expect(restartDataService.restartTransactionForPupils).toHaveBeenCalledTimes(1)
      expect(prepareCheckService.dropChecksFromCache).toHaveBeenCalledTimes(1)
    })

    test('it should throw an error if the pupil cannot be restarted', async () => {
      const schoolId = 42
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestartByPupilId').mockResolvedValue([{ id: 1 }]) // #2 is missing
      await expect(restartService.restart([pupilMock.id], 'IT issues', '', '', '', '59c38bcf3cd57f97b7da2002', schoolId))
        .rejects
        .toThrow('One of the pupils is not eligible for a restart')
    })
  })

  describe('markDeleted', () => {
    beforeEach(() => {
      jest.spyOn(pupilDataService, 'sqlFindOneBySlug').mockImplementation(() => pupilMock)
      jest.spyOn(pupilRestartDataService, 'sqlFindOpenRestartForPupil').mockImplementation(() => {
        return {
          id: 1,
          check_id: 42
        }
      })
      jest.spyOn(pupilRestartDataService, 'sqlMarkRestartAsDeleted').mockImplementation(() => null)
      jest.spyOn(prepareCheckService, 'dropChecksFromCache').mockImplementation(() => null)
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockResolvedValue()
    })

    test('returns the pupil object of the pupil who is mark as deleted', async () => {
      const deleted = await restartService.markDeleted('slug', 1, 2)
      expect(deleted).toBeDefined()
    })

    test('if no pupil is found it throws an error', async () => {
      pupilDataService.sqlFindOneBySlug.mockImplementation(() => null)
      expect.assertions(1)
      await expect(restartService.markDeleted('slug', 1, 2)).rejects.toThrow('pupil not found')
    })

    test('if pupil is frozen it throws an error', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockImplementation(() => {
        throw new Error('frozen')
      })
      await expect(restartService.markDeleted('slug, 1, 2')).rejects.toThrow('frozen')
    })

    test('find the open restart for the pupil', async () => {
      await restartService.markDeleted('slug', 1, 2)
      expect(pupilRestartDataService.sqlMarkRestartAsDeleted).toHaveBeenCalled()
    })

    test('throws an error if the restart is not found', async () => {
      pupilRestartDataService.sqlFindOpenRestartForPupil.mockImplementation(() => null)
      await expect(restartService.markDeleted('slug', 1, 2)).rejects.toThrow('No restarts found to remove')
    })

    test('does not remove any preparedChecks if the restart does not have any', async () => {
      pupilRestartDataService.sqlFindOpenRestartForPupil.mockImplementation(() => {
        return {
          id: 1,
          check_id: null
        }
      })
      await restartService.markDeleted('slug', 1, 2)
      expect(prepareCheckService.dropChecksFromCache).not.toHaveBeenCalled()
    })

    test('does removes preparedChecks if the restart has one', async () => {
      pupilRestartDataService.sqlFindOpenRestartForPupil.mockImplementation(() => {
        return {
          id: 1,
          check_id: 42
        }
      })
      await restartService.markDeleted('slug', 1, 2)
      expect(prepareCheckService.dropChecksFromCache).toHaveBeenCalled()
      expect(prepareCheckService.dropChecksFromCache).toHaveBeenCalledWith([42])
    })
  })

  describe('getReasons', () => {
    test('ensures data service method was called', async () => {
      jest.spyOn(pupilRestartDataService, 'sqlFindRestartReasons').mockResolvedValue(null)
      await restartService.getReasons()
      expect(pupilRestartDataService.sqlFindRestartReasons).toHaveBeenCalled()
    })
  })

  describe('#getPupilsEligibleForRestart', () => {
    test('calls the restart data service to find the pupils', async () => {
      const schoolId = 42
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').mockResolvedValue([])
      await restartService.getPupilsEligibleForRestart(schoolId)
      expect(restartDataService.sqlFindPupilsEligibleForRestart).toHaveBeenCalledTimes(1)
    })

    test('makes a call to the pupil identification service to get display information for the GUI', async () => {
      const schoolId = 42
      jest.spyOn(pupilIdentificationFlagService, 'sortAndAddIdentificationFlags')
      jest.spyOn(restartDataService, 'sqlFindPupilsEligibleForRestart').mockResolvedValue([])
      await restartService.getPupilsEligibleForRestart(schoolId)
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
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].status).toBe('Remove restart')
    })

    test('it does not allow a restart to be deleted when it has a check raised against it and the pupil has not logged in', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = null
      sample.restartCheckReceived = false
      sample.restartCheckComplete = false
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('it does not allow a restart to be deleted when it has a check raised against it and the pupil has logged in', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = moment()
      sample.restartCheckReceived = false
      sample.restartCheckComplete = false
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('it informs the user when the number of restarts has reached the maximum limit', async () => {
      sample.totalCheckCount = 3
      sample.restartCheckReceived = true // Show the previous restart was received...
      sample.restartCheckComplete = true // ...and completed
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].status).toBe('Maximum number of restarts taken')
    })

    test('it informs the user when the restart has been received', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = moment()
      sample.restartCheckReceived = true
      sample.restartCheckComplete = false
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('it informs the user when the restart has been completed', async () => {
      sample.restartCheckId = 1
      sample.restartCheckPupilLoginDate = moment()
      sample.restartCheckReceived = true
      sample.restartCheckComplete = true
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })

    test('the totalCheckCount is set to 0 when the totalCheckCount is null', async () => {
      sample.totalCheckCount = null
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].totalCheckCount).toBe(0)
    })

    test('the totalCheckCount is set to 0 when the totalCheckCount is undefined', async () => {
      sample.totalCheckCount = undefined
      jest.spyOn(restartDataService, 'getRestartsForSchool').mockResolvedValue([sample])
      const res = await restartService.getRestartsForSchool(1)
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
      const res = await restartService.getRestartsForSchool(1)
      expect(res[0].status).toBe('Restart taken')
    })
  })
})
