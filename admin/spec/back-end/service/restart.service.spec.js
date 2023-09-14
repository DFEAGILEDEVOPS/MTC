'use strict'

/* global beforeEach, afterEach, describe, test, expect, jest */

const prepareCheckService = require('../../../services/prepare-check.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilRestartDataService = require('../../../services/data-access/pupil-restart.data.service')
const restartDataService = require('../../../services/data-access/restart-v2.data.service')
const restartService = require('../../../services/restart.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen/pupil-frozen.service')

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
      jest.spyOn(prepareCheckService, 'removeChecks').mockImplementation()
      await expect(restartService.restart([1, 2], 'IT issues', '', '', '', '59c38bcf3cd57f97b7da2002', schoolId))
        .resolves
        .toHaveLength(2)
      expect(restartDataService.restartTransactionForPupils).toHaveBeenCalledTimes(1)
      expect(prepareCheckService.removeChecks).toHaveBeenCalledTimes(1)
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
      jest.spyOn(prepareCheckService, 'removeChecks').mockImplementation(() => null)
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
      expect(prepareCheckService.removeChecks).not.toHaveBeenCalled()
    })

    test('does removes preparedChecks if the restart has one', async () => {
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
    test('ensures data service method was called', async () => {
      jest.spyOn(pupilRestartDataService, 'sqlFindRestartReasons').mockResolvedValue(null)
      await restartService.getReasons()
      expect(pupilRestartDataService.sqlFindRestartReasons).toHaveBeenCalled()
    })
  })
})
