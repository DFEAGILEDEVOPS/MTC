const sinon = require('sinon')
const moment = require('moment')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const checkDataService = require('../../services/data-access/check.data.service')
const pupilRestartDataService = require('../../services/data-access/pupil-restart.data.service')
const pinService = require('../../services/pin.service')
const restartService = require('../../services/restart.service')
const pinValidator = require('../../lib/validator/pin-validator')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const startedCheckMock = require('../mocks/check-started')
const pupilRestartMock = require('../mocks/pupil-restart')
const restartCodesMock = require('../mocks/restart-codes')

/* global describe, it, expect, beforeEach, afterEach, spyOn */

describe('restart.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('getPupils', () => {
    it('it should throw an error if school is not found', async () => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(undefined)
      try {
        await restartService.getPupils(schoolMock.dfeNumber)
      } catch (error) {
        expect(error.message).toBe('School [9991001] not found')
      }
    })
    it('it should return a list of pupils', async () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(schoolMock)
      spyOn(pupilDataService, 'sqlFindPupilsByDfeNumber').and.returnValue([ pupil1, pupil2 ])
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
    it('it should call create if the pupil can be restarted', async () => {
      spyOn(pinService, 'expireMultiplePins').and.returnValue(null)
      spyOn(restartService, 'canAllPupilsRestart').and.returnValue(true)
      spyOn(pupilRestartDataService, 'sqlFindRestartReasonByCode').and.returnValue(2)
      spyOn(pupilRestartDataService, 'sqlCreate').and.returnValue({ 'ok': 1, 'n': 1 })
      let results
      try {
        results = await restartService.restart([ pupilMock.id, pupilMock.id ], 'IT issues', '', '', '59c38bcf3cd57f97b7da2002')
      } catch (error) {
        expect(error).toBeUndefined()
      }
      expect(pupilRestartDataService.sqlCreate).toHaveBeenCalledTimes(2)
      expect(results.length).toBe(2)
    })
    it('it should throw an error if the pupil cannot be restarted', async () => {
      spyOn(pinService, 'expireMultiplePins').and.returnValue(null)
      spyOn(restartService, 'canAllPupilsRestart').and.returnValue(false)
      spyOn(pupilRestartDataService, 'sqlFindRestartReasonByCode').and.returnValue(2)
      spyOn(pupilRestartDataService, 'sqlCreate').and.returnValue(null)
      try {
        await restartService.restart([ pupilMock.id ], 'IT issues', '', '', '59c38bcf3cd57f97b7da2002')
      } catch (error) {
        expect(error.message).toBe('One of the pupils is not eligible for a restart')
      }
      expect(pupilRestartDataService.sqlCreate).toHaveBeenCalledTimes(0)
    })
  })

  describe('canAllPupilsRestart', () => {
    it('returns true if all pupils can restart', async () => {
      spyOn(restartService, 'canRestart').and.returnValue(true)
      const result = await restartService.canAllPupilsRestart([ pupilMock.id, pupilMock.id ])
      expect(result).toBeTruthy()
    })
    it('returns false if at least one of the pupils is not eligible for a restart', async () => {
      spyOn(restartService, 'canRestart').and.returnValue(false)
      const result = await restartService.canAllPupilsRestart([ pupilMock.id, pupilMock.id ])
      expect(result).toBeFalsy()
    })
  })

  describe('getSubmittedRestarts', () => {
    it('returns a list of pupils who have been submitted for a restart', async () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'sqlFindPupilsByDfeNumber').and.returnValue([ pupil1, pupil2 ])
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(pupilRestartMock)
      spyOn(restartService, 'getStatus').and.returnValue('Remove restart')
      spyOn(pupilRestartDataService, 'sqlFindRestartReasonDescById').and.returnValue('Did Not Complete')
      const result = await restartService.getSubmittedRestarts(schoolMock.id)
      expect(result.length).toBe(2)
    })
    it('returns an empty list if no pupil has been submitted for a restart', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsByDfeNumber').and.returnValue([])
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
    it('returns the pupil object of the pupil who is mark as deleted', async () => {
      spyOn(pupilDataService, 'sqlFindOneById').and.returnValue(pupilMock)
      spyOn(checkDataService, 'sqlFindLatestCheck').and.returnValue(startedCheckMock)
      spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
      spyOn(pupilRestartDataService, 'sqlMarkRestartAsDeleted').and.returnValue(null)
      const deleted = await restartService.markDeleted(pupilMock.id)
      expect(deleted).toBeDefined()
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
