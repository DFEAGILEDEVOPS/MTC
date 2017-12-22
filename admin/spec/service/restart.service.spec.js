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
      spyOn(schoolDataService, 'findOne').and.returnValue(null)
      try {
        await restartService.getPupils(schoolMock._id)
      } catch (error) {
        expect(error.message).toBe('School [9991001] not found')
      }
    })
    it('it should return a list of pupils', async () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      spyOn(schoolDataService, 'findOne').and.returnValue(schoolMock)
      spyOn(pupilDataService, 'getSortedPupils').and.returnValue([ pupil1, pupil2 ])
      spyOn(restartService, 'isPupilEligible').and.returnValue(true)
      let result
      try {
        result = await restartService.getPupils(schoolMock._id)
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
      spyOn(checkDataService, 'sqlGetNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      let result
      try {
        result = await restartService.canRestart(pupilMock._id)
      } catch (err) {
        expect(err).toBeUndefined()
      }
      expect(result).toBeTruthy()
    })
    it('it should return false if the pupil has 3 started checks', async () => {
      spyOn(checkDataService, 'sqlGetNumberOfChecksStartedByPupil').and.returnValue(3)
      spyOn(pupilRestartDataService, 'count').and.returnValue(2)
      let result
      try {
        result = await restartService.canRestart(pupilMock._id)
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
      spyOn(pupilRestartDataService, 'create').and.returnValue({ 'ok': 1, 'n': 1 })
      let results
      try {
        results = await restartService.restart([ pupilMock._id, pupilMock._id ], 'IT issues', '', '', '59c38bcf3cd57f97b7da2002')
      } catch (error) {
        expect(error).toBeUndefined()
      }
      expect(pupilRestartDataService.create).toHaveBeenCalledTimes(2)
      expect(results.length).toBe(2)
    })
    it('it should throw an error if the pupil cannot be restarted', async () => {
      spyOn(pinService, 'expireMultiplePins').and.returnValue(null)
      spyOn(restartService, 'canAllPupilsRestart').and.returnValue(false)
      spyOn(pupilRestartDataService, 'create').and.returnValue(null)
      try {
        await restartService.restart([ pupilMock._id ], 'IT issues', '', '', '59c38bcf3cd57f97b7da2002')
      } catch (error) {
        expect(error.message).toBe('One of the pupils is not eligible for a restart')
      }
      expect(pupilRestartDataService.create).toHaveBeenCalledTimes(0)
    })
  })
  describe('canAllPupilsRestart', () => {
    it('returns true if all pupils can restart', async () => {
      spyOn(restartService, 'canRestart').and.returnValue(true)
      const result = await restartService.canAllPupilsRestart([ pupilMock._id, pupilMock._id ])
      expect(result).toBeTruthy()
    })
    it('returns false if at least one of the pupils is not eligible for a restart', async () => {
      spyOn(restartService, 'canRestart').and.returnValue(false)
      const result = await restartService.canAllPupilsRestart([ pupilMock._id, pupilMock._id ])
      expect(result).toBeFalsy()
    })
  })
  describe('getSubmittedRestarts', () => {
    it('returns a list of  if all pupils can restart', async () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getSortedPupils').and.returnValue([ pupil1, pupil2 ])
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(pupilRestartMock)
      spyOn(restartService, 'getStatus').and.returnValue('Remove restart')
      const result = await restartService.getSubmittedRestarts(schoolMock._id)
      expect(result.length).toBe(2)
    })
    it('returns an empty list if no pupil has been submitted for a restart', async () => {
      spyOn(pupilDataService, 'getSortedPupils').and.returnValue([])
      const result = await restartService.getSubmittedRestarts(schoolMock._id)
      expect(result.length).toBe(0)
    })
  })
  describe('getStatus', () => {
    it('returns maximum number reached if the restart or check count reaches the limit', async () => {
      spyOn(checkDataService, 'sqlGetNumberOfChecksStartedByPupil').and.returnValue(3)
      spyOn(pupilRestartDataService, 'count').and.returnValue(2)
      spyOn(pupilRestartDataService, 'getRestartCodes').and.returnValue(restartCodesMock)
      const status = await restartService.getStatus(pupilMock._id)
      expect(status).toBe('Maximum number of restarts taken')
    })
    it('returns remove restart if the pupil has been submitted for a restart', async () => {
      spyOn(checkDataService, 'sqlGetNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'getRestartCodes').and.returnValue(restartCodesMock)
      const status = await restartService.getStatus(pupilMock._id)
      expect(status).toBe('Remove restart')
    })
    it('returns restart taken if the pupil has taken the restart', async () => {
      spyOn(checkDataService, 'sqlGetNumberOfChecksStartedByPupil').and.returnValue(2)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'getRestartCodes').and.returnValue(restartCodesMock)
      const status = await restartService.getStatus(pupilMock._id)
      expect(status).toBe('Restart taken')
    })
  })
  describe('markDeleted', () => {
    it('returns the pupil object of the pupil who is mark as deleted', async () => {
      spyOn(pupilDataService, 'findOne').and.returnValue(pupilMock)
      spyOn(checkDataService, 'sqlFindLatestCheck').and.returnValue(startedCheckMock)
      spyOn(pupilDataService, 'update').and.returnValue(pupilMock)
      spyOn(pupilRestartDataService, 'update').and.returnValue({ n: 1, nModified: 1, ok: 1 })
      const deleted = await restartService.markDeleted(pupilMock._id)
      expect(deleted).toBeDefined()
    })
    it('throws an error if the deletion failed', async () => {
      spyOn(pupilDataService, 'findOne').and.returnValue(pupilMock)
      spyOn(checkDataService, 'sqlFindLatestCheck').and.returnValue(startedCheckMock)
      spyOn(pupilDataService, 'update').and.returnValue(pupilMock)
      spyOn(pupilRestartDataService, 'update').and.returnValue({})
      let deleted
      try {
        deleted = await restartService.markDeleted(pupilMock._id)
      } catch (error) {
        expect(error.message).toBe(`Restart deletion marking failed for pupil ${pupilMock.lastName} ${pupilMock.foreName} failed`)
      }
      expect(deleted).toBeUndefined()
    })
  })
})
