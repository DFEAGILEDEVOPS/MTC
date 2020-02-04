'use strict'

/* global beforeEach, afterEach, describe, it, expect, spyOn, fail, jest */

const prepareCheckService = require('../../../services/prepare-check.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilRestartDataService = require('../../../services/data-access/pupil-restart.data.service')
const restartDataService = require('../../../services/data-access/restart-v2.data.service')
const restartService = require('../../../services/restart.service')

const pupilMock = require('../mocks/pupil')

describe('restart.service', () => {
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
      // allow `incomingPupilValidation()` to match
      spyOn(restartDataService, 'sqlFindPupilsEligibleForRestartByPupilId').and.returnValue([{ id: 1 }, { id: 2 }])
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
      try {
        // allow `incomingPupilValidation()` to fail
        spyOn(restartDataService, 'sqlFindPupilsEligibleForRestartByPupilId').and.returnValue([{ id: 1 }]) // #2 is missing
        await restartService.restart([pupilMock.id], 'IT issues', '', '', '', '59c38bcf3cd57f97b7da2002', schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('One of the pupils is not eligible for a restart')
      }
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
