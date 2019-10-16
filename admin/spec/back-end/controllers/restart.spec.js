'use strict'
/* global describe it expect beforeEach jasmine spyOn fail */

const httpMocks = require('node-mocks-http')
const logger = require('../../../services/log.service.js').getLogger()

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const restartService = require('../../../services/restart.service')
const restartV2Service = require('../../../services/restart-v2.service')
const restartValidator = require('../../../lib/validator/restart-validator')
const groupService = require('../../../services/group.service')
const pupilStatusService = require('../../../services/pupil.status.service')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const businessAvailabilityService = require('../../../services/business-availability.service')
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
    const goodReqParams = {
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
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(false)
    })

    it('displays the restart overview page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getRestartOverview
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartV2Service, 'getRestartsForSchool').and.returnValue({ id: 'test' })
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ restartsAvailable: true })
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Restarts')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      done()
    })
    it('throws an error if getSubmittedResults has an error', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getRestartOverview
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartV2Service, 'getRestartsForSchool').and.returnValue(Promise.reject(new Error()))
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ restartsAvailable: true })
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Restarts')
      expect(res.render).toHaveBeenCalledTimes(0)
      expect(next).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
      done()
    })
  })

  describe('getSelectRestartList route', () => {
    let next
    const goodReqParams = {
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
      spyOn(restartService, 'getReasons').and.returnValue(null)
      spyOn(restartV2Service, 'getPupilsEligibleForRestart').and.returnValue(pupilsMock)
      spyOn(groupService, 'findGroupsByPupil').and.returnValue(null)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ restartsAvailable: true })
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Select pupils for restart')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      done()
    })

    it('calls next if an error occurs within restart service', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getSelectRestartList
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartV2Service, 'getPupilsEligibleForRestart').and.throwError(new Error('mock error'))
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ restartsAvailable: true })
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
    const goodReqParams = {
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
      spyOn(restartValidator, 'validateReason').and.returnValue(validationError)
      spyOn(restartV2Service, 'getPupilsEligibleForRestart').and.returnValue(pupilsMock)
      spyOn(restartService, 'getReasons').and.returnValue(null)
      spyOn(groupService, 'findGroupsByPupil').and.returnValue(pupilsMock)
      spyOn(res, 'render').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
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
      spyOn(restartService, 'restart').and.returnValue([{ ok: 1, n: 1 }, { ok: 1, n: 1 }])
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
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
      spyOn(restartService, 'restart').and.returnValue([{ ok: 1, n: 1 }])
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
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
      spyOn(restartService, 'restart').and.returnValue([{ ok: 1, n: 1 }, { ok: 1, n: 1 }])
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
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
      spyOn(restartService, 'restart').and.returnValue([{ ok: 1, n: 1 }, { ok: 1, n: 1 }])
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds').and.returnValue(Promise.reject(new Error('a mock error')))
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
      spyOn(logger, 'error')
      const controller = require('../../../controllers/restart').postSubmitRestartList
      try {
        await controller(req, res, next)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('a mock error')
        expect(logger.error).toHaveBeenCalledTimes(1)
      }
    })
    it('ensures all pupil ids are numeric values before calling recalculateStatusByPupilIds and restart service methods', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const pupilIds = []
      const processedPupilIds = []
      for (let i = 0; i <= 40; i++) {
        pupilIds.push(i < 20 ? i : { i })
        processedPupilIds.push(i)
      }
      req.body = {
        pupil: pupilIds
      }
      const validationError = new ValidationError()
      spyOn(restartValidator, 'validateReason').and.returnValue(validationError)
      const restartServiceSpy = spyOn(restartService, 'restart').and.returnValue([{ ok: 1, n: 1 }, { ok: 1, n: 1 }])
      spyOn(res, 'redirect').and.returnValue(null)
      const recalculateStatusByPupilIdsSpy = spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      expect(recalculateStatusByPupilIdsSpy.calls.first().args[0]).toEqual(processedPupilIds)
      expect(restartServiceSpy.calls.first().args[0]).toEqual(processedPupilIds)
    })
  })

  describe('postDeleteRestart route', () => {
    let next
    const goodReqParams = {
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

    it('redirects to restart overview page when successfully marking the pupil as deleted', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(restartService, 'markDeleted').and.returnValue(pupilMock)
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
      const controller = require('../../../controllers/restart').postDeleteRestart
      await controller(req, res, next)
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.determineRestartsEligibility).toHaveBeenCalled()
    })

    it('calls next if error occurred while marking the pupil as deleted', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
      spyOn(logger, 'error') // swallow the error message that is expected
      spyOn(restartService, 'markDeleted').and.returnValue(Promise.reject(new Error('error')))
      const controller = require('../../../controllers/restart').postDeleteRestart
      await controller(req, res, next)
      expect(next).toHaveBeenCalled()
      done()
    })

    it('makes a request for the pupil status to be refreshed', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(restartService, 'markDeleted').and.returnValue(pupilMock)
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
      const controller = require('../../../controllers/restart').postDeleteRestart
      await controller(req, res, next)
      expect(pupilStatusService.recalculateStatusByPupilIds).toHaveBeenCalledTimes(1)
    })

    it('throws an error if the pupil status refresh goes wrong', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(restartService, 'markDeleted').and.returnValue(pupilMock)
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pupilStatusService, 'recalculateStatusByPupilIds').and.returnValue(Promise.reject(new Error('a mock error')))
      spyOn(logger, 'error')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineRestartsEligibility')
      const controller = require('../../../controllers/restart').postDeleteRestart

      try {
        await controller(req, res, next)
        fail('expected to throw')
      } catch (error) {
        expect(logger.error).toHaveBeenCalledTimes(1)
        expect(error.message).toBe('a mock error')
      }
    })
  })
})
