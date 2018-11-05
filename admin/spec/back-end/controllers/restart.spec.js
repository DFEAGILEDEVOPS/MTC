'use strict'
/* global describe it expect beforeEach jasmine spyOn fail */

const httpMocks = require('node-mocks-http')
const winston = require('winston')

const restartService = require('../../../services/restart.service')
const restartV2Service = require('../../../services/restart-v2.service')
const restartValidator = require('../../../lib/validator/restart-validator')
const groupService = require('../../../services/group.service')
const pupilStatusService = require('../../../services/pupil.status.service')
const pupilIdentificationFlag = require('../../../services/pupil-identification-flag.service')
const ValidationError = require('../../../lib/validation-error')
const pupilMock = require('../mocks/pupil')
const pupilsMock = require('../mocks/pupils')


describe('restart controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('getRestartOverview route', () => {
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/restart/overview',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      user: {
        School: 9991001
      }
    }
    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    it('displays the restart overview page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getRestartOverview
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartService, 'getSubmittedRestarts').and.returnValue({ id: 'test' })
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Restarts')
      expect(res.render).toHaveBeenCalled()
      done()
    })
    it('throws an error if getSubmittedResults has an error', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getRestartOverview
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartService, 'getSubmittedRestarts').and.returnValue(Promise.reject(new Error()))
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Restarts')
      expect(res.render).toHaveBeenCalledTimes(0)
      expect(next).toHaveBeenCalled()
      done()
    })
  })

  describe('getSelectRestartList route', () => {
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/restart/select-restart-list',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      user: {
        School: 9991001,
        schoolId: 1
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    it('displays the restart pupils list page', async (done) => {
      const res = getRes()

      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getSelectRestartList
      spyOn(res, 'render').and.returnValue(null)
      spyOn(pupilIdentificationFlag, 'addIdentificationFlags').and.returnValue(pupilsMock)
      spyOn(restartService, 'getPupils').and.returnValue(pupilsMock)
      spyOn(restartService, 'getReasons').and.returnValue(null)
      spyOn(restartV2Service, 'getPupilsEligibleForRestart').and.returnValue(pupilsMock)
      spyOn(groupService, 'findGroupsByPupil').and.returnValue(null)
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Select pupils for restart')
      expect(res.render).toHaveBeenCalled()
      done()
    })

    it('calls next if an error occurs within restart service', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getSelectRestartList
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartService, 'getPupils').and.throwError(new Error('mock error'))
      spyOn(restartV2Service, 'getPupilsEligibleForRestart').and.throwError(new Error('mock error'))
      try {
        await controller(req, res, next)
        expect(next).toHaveBeenCalledWith(new Error('mock error'))
      } catch (error) {
        fail('not expected to throw')
      }
      done()
    })
  })

  describe('postSubmitRestartList route', () => {
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/restart/overview',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      user: {
        Name: 'test'
      }
    }
    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    it('redirects the restart list page if no pupils are provided', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').postSubmitRestartList
      spyOn(res, 'redirect').and.returnValue(null)
      await controller(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/restart/select-restart-list')
      done()
    })

    it('renders again the restart list page if the validation fails', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      validationError.addError('didNotCompleteInfo', 'Error: Please specify further information when "Did not complete" option is selected')
      spyOn(pupilIdentificationFlag, 'addIdentificationFlags').and.returnValue(pupilsMock)
      spyOn(restartValidator, 'validateReason').and.returnValue(validationError)
      spyOn(restartService, 'getPupils').and.returnValue(pupilMock)
      spyOn(restartV2Service, 'getPupilsEligibleForRestart').and.returnValue(pupilsMock)
      spyOn(restartService, 'getReasons').and.returnValue(null)
      spyOn(groupService, 'findGroupsByPupil').and.returnValue(pupilsMock)
      spyOn(res, 'render').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Error: Select pupils for restart')
      expect(res.render).toHaveBeenCalled()
      done()
    })

    it('renders the restart overview page when successfully submitted restarts', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      spyOn(restartValidator, 'validateReason').and.returnValue(validationError)
      spyOn(restartService, 'restart').and.returnValue([{ 'ok': 1, 'n': 1 }, { 'ok': 1, 'n': 1 }])
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      const requestFlashCalls = req.flash.calls.all()
      expect(req.flash).toHaveBeenCalled()
      expect(requestFlashCalls[0].args[1]).toBe('Restarts made for 2 pupils')
      expect(res.redirect).toHaveBeenCalled()
      done()
    })

    it('renders a specific flash message for 1 pupil', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      spyOn(restartValidator, 'validateReason').and.returnValue(validationError)
      spyOn(restartService, 'restart').and.returnValue([{ 'ok': 1, 'n': 1 }])
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      const requestFlashCalls = req.flash.calls.all()
      expect(requestFlashCalls[0].args[1]).toBe('Restart made for 1 pupil')
      done()
    })

    it('makes a request to update the pupil status after adding the restart', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      spyOn(restartValidator, 'validateReason').and.returnValue(validationError)
      spyOn(restartService, 'restart').and.returnValue([{ 'ok': 1, 'n': 1 }, { 'ok': 1, 'n': 1 }])
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      expect(pupilStatusService.recalculateStatusByPupilIds).toHaveBeenCalledTimes(1)
    })

    it('throws an error if the attempt to refresh the pupils status fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      spyOn(restartValidator, 'validateReason').and.returnValue(validationError)
      spyOn(restartService, 'restart').and.returnValue([{ 'ok': 1, 'n': 1 }, { 'ok': 1, 'n': 1 }])
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds').and.returnValue(Promise.reject(new Error('a mock error')))
      spyOn(winston, 'error')
      const controller = require('../../../controllers/restart').postSubmitRestartList
      try {
        await controller(req, res, next)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('a mock error')
        expect(winston.error).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('postDeleteRestart route', () => {
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/restart/overview',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupilId: '59c38bcf3cd57f97b7da2011'
      },
      user: {
        id: '1111'
      }
    }
    beforeEach(() => {
      next = jasmine.createSpy('next')
    })
    it('redirects to restart overview page when successfully marking the pupil as deleted', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(restartService, 'markDeleted').and.returnValue(pupilMock)
      spyOn(res, 'redirect').and.returnValue(null)
      const controller = require('../../../controllers/restart').postDeleteRestart
      await controller(req, res, next)
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      done()
    })
    it('calls next if error occurred while marking the pupil as deleted', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(restartService, 'markDeleted').and.returnValue(Promise.reject(new Error('error')))
      const controller = require('../../../controllers/restart').postDeleteRestart
      await controller(req, res, next)
      expect(next).toHaveBeenCalled()
      done()
    })
  })
})
