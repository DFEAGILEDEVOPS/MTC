'use strict'

const R = require('ramda')
const moment = require('moment')
const proxyquire = require('proxyquire').noCallThru()
const pupilDataService = require('../../services/data-access/pupil.data.service')
const checkDataService = require('../../services/data-access/check.data.service')
const pupilRestartDataService = require('../../services/data-access/pupil-restart.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const pupilService = require('../../services/pupil.service')
const pinValidator = require('../../lib/validator/pin-validator')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const pupilStatusCodesMock = require('../mocks/pupil-status-codes')
const checkMock = require('../mocks/check')
const checkStartedMock = require('../mocks/check-started')
const pupilRestartMock = require('../mocks/pupil-restart')
const completedCheckMock = require('../mocks/completed-check')

/* global describe, it, expect, spyOn */

describe('pupil service', () => {
  const getPupil = () => R.assoc('school', R.clone(schoolMock), pupilMock)

  const pupilMockPromise = () => {
    return Promise.resolve(getPupil())
  }

  function setupService (pupilDataService) {
    return proxyquire('../../services/pupil.service', {
      './data-access/pupil.data.service': pupilDataService
    })
  }

  describe('#fetchOnePupil', () => {
    it('it makes a call to the pupilDataService', async () => {
      spyOn(pupilDataService, 'findOne').and.returnValue(pupilMockPromise())
      const service = setupService(pupilDataService)
      await service.fetchOnePupil('arg1', 'arg2')
      expect(pupilDataService.findOne).toHaveBeenCalledWith({ _id: 'arg1', school: 'arg2' })
    })
  })

  describe('#fetchMultiplePupils', () => {
    it('it makes a call to the pupilDataService for each pupil', async () => {
      spyOn(pupilDataService, 'findOne').and.returnValue(pupilMockPromise())
      const service = setupService(pupilDataService)
      const res = await service.fetchMultiplePupils([ 1, 2, 3, 4, 5 ])
      expect(pupilDataService.findOne).toHaveBeenCalledTimes(5)
      expect(res.length).toBe(5)
    })
  })

  describe('getStatus', () => {
    it('returns not taking the Check if the pupil has got an attendance code', async () => {
      const pupil = Object.assign({}, pupilMock)
      pupil.attendanceCode = {
        _id: 'id',
        dateRecorded: moment.utc(),
        byUserName: 'test',
        byUserEmail: 'test@email.com'
      }
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      const result = await pupilService.getStatus(pupil)
      expect(result).toBe('Not taking the Check')
    })
    it('returns restart if pupil has an active restart and total started checks are equal to restarts', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'count').and.returnValue(1)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const result = await pupilService.getStatus(pupil)
      expect(result).toBe('Restart')
    })
    it('returns not started when pupil does not have an active pin and no check record', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(0)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(null)
      const result = await pupilService.getStatus(pupil)
      expect(result).toBe('Not started')
    })
    it('returns pin generated when pupil has an active pin and no check record', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(0)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(null)
      const result = await pupilService.getStatus(pupil)
      expect(result).toBe('PIN generated')
    })
    it('returns in progress when pupil has active pin but a check record with no check started timestamp', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(0)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(checkMock)
      const result = await pupilService.getStatus(pupil)
      expect(result).toBe('In Progress')
    })
    it('returns check started when pupil does not have an active pin and a completed check record but a started check', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue(0)
      spyOn(completedCheckDataService, 'find').and.returnValue([])
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(checkStartedMock)
      const result = await pupilService.getStatus(pupil)
      expect(result).toBe('Check started')
    })
    it('returns completed when a completed check that corresponds to the check code is found', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'getStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(checkDataService, 'count').and.returnValue(1)
      spyOn(pupilRestartDataService, 'findLatest').and.returnValue(null)
      spyOn(pupilRestartDataService, 'count').and.returnValue()
      spyOn(completedCheckDataService, 'find').and.returnValue([completedCheckMock])
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'findLatestCheck').and.returnValue(checkStartedMock)
      const result = await pupilService.getStatus(pupil)
      expect(result).toBe('Complete')
    })
  })
})
