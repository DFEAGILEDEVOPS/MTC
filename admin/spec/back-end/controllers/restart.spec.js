'use strict'
/* global describe expect beforeEach afterEach jest test fail */

const httpMocks = require('node-mocks-http')
const logger = require('../../../services/log.service.js').getLogger()
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const restartService = require('../../../services/restart.service')
const restartV2Service = require('../../../services/restart-v2.service')
const restartValidator = require('../../../lib/validator/restart-validator')
const groupService = require('../../../services/group.service')
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
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
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
      next = jest.fn()
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('displays the restart overview page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getRestartOverview
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(restartV2Service, 'getRestartsForSchool').mockResolvedValue({ id: 'test' })
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ restartsAvailable: true })
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Select pupils to restart the check')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
    })
    test('throws an error if getSubmittedResults has an error', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getRestartOverview
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(restartV2Service, 'getRestartsForSchool').mockRejectedValue(new Error())
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ restartsAvailable: true })
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Select pupils to restart the check')
      expect(res.render).toHaveBeenCalledTimes(0)
      expect(next).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
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
      next = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('displays the restart pupils list page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getSelectRestartList
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(restartService, 'getReasons').mockImplementation()
      jest.spyOn(restartV2Service, 'getPupilsEligibleForRestart').mockResolvedValue(pupilsMock)
      jest.spyOn(groupService, 'findGroupsByPupil').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ restartsAvailable: true })
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Select pupils for restart')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
    })

    test('calls next if an error occurs within restart service', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').getSelectRestartList
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(restartV2Service, 'getPupilsEligibleForRestart').mockRejectedValue(new Error('mock error'))
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ restartsAvailable: true })
      try {
        await controller(req, res, next)
        expect(next).toHaveBeenCalledWith(new Error('mock error'))
      } catch (error) {
        fail('not expected to throw')
      }
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
      next = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('redirects the restart list page if no pupils are provided', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../../controllers/restart').postSubmitRestartList
      jest.spyOn(res, 'redirect').mockImplementation()
      await controller(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/restart/select-restart-list')
    })

    test('renders again the restart list page if the validation fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      validationError.addError('didNotCompleteInfo', 'Error: Please specify further information when "Did not complete" option is selected')
      jest.spyOn(restartValidator, 'validateReason').mockReturnValue(validationError)
      jest.spyOn(restartV2Service, 'getPupilsEligibleForRestart').mockResolvedValue(pupilsMock)
      jest.spyOn(restartService, 'getReasons').mockImplementation()
      jest.spyOn(groupService, 'findGroupsByPupil').mockResolvedValue(pupilsMock)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineRestartsEligibility').mockImplementation()
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Error: Select pupils for restart')
      expect(res.render).toHaveBeenCalled()
    })

    test('renders the restart overview page when successfully submitted restarts', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      jest.spyOn(restartValidator, 'validateReason').mockReturnValue(validationError)
      jest.spyOn(restartService, 'restart').mockResolvedValue([{ ok: 1, n: 1 }, { ok: 1, n: 1 }])
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineRestartsEligibility').mockImplementation()
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      expect(req.flash).toHaveBeenCalledWith('info', 'Restarts made for 2 pupils')
      expect(res.redirect).toHaveBeenCalled()
    })

    test('renders a specific flash message for 1 pupil', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body = {
        pupil: [pupilMock._id]
      }
      const validationError = new ValidationError()
      jest.spyOn(restartValidator, 'validateReason').mockReturnValue(validationError)
      jest.spyOn(restartService, 'restart').mockResolvedValue([{ ok: 1, n: 1 }])
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineRestartsEligibility').mockImplementation()
      const controller = require('../../../controllers/restart').postSubmitRestartList
      await controller(req, res, next)
      expect(req.flash).toHaveBeenCalledWith('info', 'Restart made for 1 pupil')
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
      next = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('redirects to restart overview page when successfully marking the pupil as deleted', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(restartService, 'markDeleted').mockResolvedValue(pupilMock)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineRestartsEligibility').mockImplementation()
      const controller = require('../../../controllers/restart').postDeleteRestart
      await controller(req, res, next)
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.determineRestartsEligibility).toHaveBeenCalled()
    })

    test('calls next if error occurred while marking the pupil as deleted', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineRestartsEligibility').mockImplementation()
      jest.spyOn(logger, 'error').mockImplementation() // swallow the error message that is expected
      jest.spyOn(restartService, 'markDeleted').mockRejectedValue(new Error('error'))
      const controller = require('../../../controllers/restart').postDeleteRestart
      await controller(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
