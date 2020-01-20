'use strict'

/* global beforeEach, afterEach, describe, it, expect, spyOn, fail, jest */
const moment = require('moment')

const checkDataService = require('../../../services/data-access/check.data.service')
const pinValidator = require('../../../lib/validator/pin-validator')
const prepareCheckService = require('../../../services/prepare-check.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilRestartDataService = require('../../../services/data-access/pupil-restart.data.service')
const pupilStatusService = require('../../../services/pupil.status.service')
const restartDataService = require('../../../services/data-access/restart-v2.data.service')
const restartService = require('../../../services/restart.service')
const schoolDataService = require('../../../services/data-access/school.data.service')

const pupilMock = require('../mocks/pupil')
const pupilRestartMock = require('../mocks/pupil-restart')
const restartCodesMock = require('../mocks/restart-codes')
const schoolMock = require('../mocks/school')

describe('restart.service', () => {
  describe('getPupils', () => {
    it('it should throw an error if school is not found', async () => {
      spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(undefined)
      try {
        await restartService.getPupils(schoolMock.id)
      } catch (error) {
        expect(error.message).toBe(`School [${schoolMock.id}] not found`)
      }
    })
    it('it should return a list of pupils', async () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      spyOn(schoolDataService, 'sqlFindOneById').and.returnValue(schoolMock)
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').and.returnValue([pupil1, pupil2])
      spyOn(restartService, 'isPupilEligible').and.returnValue(true)
      let result
      try {
        result = await restartService.getPupils(schoolMock.id)
      } catch (error) {
        expect(error).toBeUndefined()
      }
      expect(result.length).toBe(2)
    })
  })

  describe('isPupilEligible', () => {
    it('it should return false if the pupil is not allowed to be restarted', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(restartService, 'canRestart').and.returnValue(false)
      const result = await restartService.isPupilEligible(pupil)
      expect(result).toBeFalsy()
    })
    it('it should return false if pupil has an attendance code', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(restartService, 'canRestart').and.returnValue(true)
      pupil.attendanceCode = { code: 2 }
      const result = await restartService.isPupilEligible(pupil)
      expect(result).toBeFalsy()
    })
    it('it should return true if pupil does not have an active pin', async () => {
      const pupil = Object.assign({}, pupilMock)
      pupil.pinExpiresAt = moment.utc()
      spyOn(restartService, 'canRestart').and.returnValue(true)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const result = await restartService.isPupilEligible(pupil)
      expect(result).toBeTruthy()
    })
  })

  describe('canRestart', () => {
    it('it should return true if the pupil has 1 started check and no restart requested', async () => {
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(0)
      let result
      try {
        result = await restartService.canRestart(pupilMock.id)
      } catch (err) {
        expect(err).toBeUndefined()
      }
      expect(result).toBeTruthy()
    })
    it('it should return false if the pupil has 3 started checks', async () => {
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(3)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(2)
      let result
      try {
        result = await restartService.canRestart(pupilMock.id)
      } catch (err) {
        expect(err).toBeUndefined()
      }
      expect(result).toBeFalsy()
    })
  })

  describe('restart', () => {
    it('throws an error if the schoolId is not provided', async () => {
      try {
        await restartService.restart([1, 2], 'Test', '', '', '', '59c38bcf3cd57f97b7da2002', undefined)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing parameter: `schoolId`')
      }
    })

    it('it should call restartTransactionForPupils if the pupil can be restarted', async () => {
      const schoolId = 42
      spyOn(restartService, 'canAllPupilsRestart').and.returnValue(true)
      spyOn(restartDataService, 'getLiveCheckDataByPupilId').and.returnValue(
        Promise.resolve([
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
        ])
      )
      spyOn(restartDataService, 'restartTransactionForPupils').and.returnValue(Promise.resolve(
        [
          { id: 1, urlSlug: 'abc-def' },
          { id: 2, urlSlug: 'def-hij' }
        ]
      ))
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(prepareCheckService, 'removeChecks')
      let results
      try {
        results = await restartService.restart([1, 2], 'IT issues', '', '', '', '59c38bcf3cd57f97b7da2002', schoolId)
      } catch (error) {
        fail(error)
      }
      expect(restartDataService.restartTransactionForPupils).toHaveBeenCalledTimes(1)
      expect(prepareCheckService.removeChecks).toHaveBeenCalledTimes(1)
      expect(results.length).toBe(2)
    })

    it('it should throw an error if the pupil cannot be restarted', async () => {
      const schoolId = 42
      spyOn(restartService, 'canAllPupilsRestart').and.returnValue(false)
      try {
        await restartService.restart([pupilMock.id], 'IT issues', '', '', '', '59c38bcf3cd57f97b7da2002', schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('One of the pupils is not eligible for a restart')
      }
    })
  })

  describe('canAllPupilsRestart', () => {
    it('returns true if all pupils can restart', async () => {
      spyOn(restartService, 'canRestart').and.returnValue(true)
      const result = await restartService.canAllPupilsRestart([pupilMock.id, pupilMock.id])
      expect(result).toBeTruthy()
    })
    it('returns false if at least one of the pupils is not eligible for a restart', async () => {
      spyOn(restartService, 'canRestart').and.returnValue(false)
      const result = await restartService.canAllPupilsRestart([pupilMock.id, pupilMock.id])
      expect(result).toBeFalsy()
    })
  })

  describe('getSubmittedRestarts', () => {
    it('returns a list of pupils who have been submitted for a restart', async () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').and.returnValue([pupil1, pupil2])
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(pupilRestartMock)
      spyOn(restartService, 'getStatus').and.returnValue('Remove restart')
      spyOn(pupilRestartDataService, 'sqlFindRestartReasonDescById').and.returnValue('Did Not Complete')
      const result = await restartService.getSubmittedRestarts(schoolMock.id)
      expect(result.length).toBe(2)
    })
    it('returns an empty list if no pupil has been submitted for a restart', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').and.returnValue([])
      const result = await restartService.getSubmittedRestarts(schoolMock.id)
      expect(result.length).toBe(0)
    })
  })

  describe('getStatus', () => {
    it('returns maximum number reached if the restart or check count reaches the limit', async () => {
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(3)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(2)
      spyOn(pupilRestartDataService, 'sqlFindRestartCodes').and.returnValue(restartCodesMock)
      const status = await restartService.getStatus(pupilMock.id)
      expect(status).toBe('Maximum number of restarts taken')
    })
    it('returns remove restart if the pupil has been submitted for a restart', async () => {
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'sqlFindRestartCodes').and.returnValue(restartCodesMock)
      const status = await restartService.getStatus(pupilMock.id)
      expect(status).toBe('Remove restart')
    })
    it('returns restart taken if the pupil has taken the restart', async () => {
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(2)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'sqlFindRestartCodes').and.returnValue(restartCodesMock)
      const status = await restartService.getStatus(pupilMock.id)
      expect(status).toBe('Restart taken')
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
      jest.spyOn(prepareCheckService, 'removeChecks').mockImplementation(() => null)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('returns the pupil object of the pupil who is mark as deleted', async () => {
      const deleted = await restartService.markDeleted('slug', 1, 2)
      expect(deleted).toBeDefined()
    })

    it('if no pupil is found it throws an error', async () => {
      pupilDataService.sqlFindOneBySlug.mockImplementation(() => null)
      expect.assertions(1)
      try {
        await restartService.markDeleted('slug', 1, 2)
      } catch (error) {
        expect(error.message).toBe('pupil not found')
      }
    })

    it('find the open restart for the pupil', async () => {
      await restartService.markDeleted('slug', 1, 2)
      expect(pupilRestartDataService.sqlMarkRestartAsDeleted).toHaveBeenCalled()
    })

    it('throws an error if the restart is not found', async () => {
      pupilRestartDataService.sqlFindOpenRestartForPupil.mockImplementation(() => null)
      try {
        await restartService.markDeleted('slug', 1, 2)
      } catch (error) {
        expect(error.message).toBe('No restarts found to remove')
      }
    })

    it('does not remove any preparedChecks if the restart does not have any', async () => {
      pupilRestartDataService.sqlFindOpenRestartForPupil.mockImplementation(() => {
        return {
          id: 1,
          check_id: null
        }
      })
      await restartService.markDeleted('slug', 1, 2)
      expect(prepareCheckService.removeChecks).not.toHaveBeenCalled()
    })

    it('does removes preparedChecks if the restart has one', async () => {
      pupilRestartDataService.sqlFindOpenRestartForPupil.mockImplementation(() => {
        return {
          id: 1,
          check_id: 42
        }
      })
      await restartService.markDeleted('slug', 1, 2)
      expect(prepareCheckService.removeChecks).toHaveBeenCalled()
      expect(prepareCheckService.removeChecks).toHaveBeenCalledWith([42])
    })
  })

  describe('getReasons', () => {
    it('ensures data service method was called', async () => {
      spyOn(pupilRestartDataService, 'sqlFindRestartReasons').and.returnValue(null)
      await restartService.getReasons()
      expect(pupilRestartDataService.sqlFindRestartReasons).toHaveBeenCalled()
    })
  })
})
