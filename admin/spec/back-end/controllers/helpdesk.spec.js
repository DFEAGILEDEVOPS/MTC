'use strict'

/* global describe it expect jasmine beforeEach spyOn */

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const controller = require('../../../controllers/helpdesk')
const pupilRegisterService = require('../../../services/pupil-register.service')
const schoolService = require('../../../services/school.service')
const resultPageAvailabilityService = require('../../../services/results-page-availability.service')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const schoolMock = require('../mocks/school')
const schoolImpersonationService = require('../../../services/school-impersonation.service')
const ValidationError = require('../../../lib/validation-error')

const httpMocks = require('node-mocks-http')

describe('helpdesk controller', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = params.user || { School: 9991001 }
    req.session = params.session || {}
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }
  beforeEach(() => {
    next = jasmine.createSpy('next')
  })
  describe('getSchoolImpersonation', () => {
    const reqParams = {
      method: 'GET',
      url: '/school-impersonation'
    }
    it('should call schoolImpersonationService.removeImpersonation method to remove existing helpdesk impersonation', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(schoolImpersonationService, 'removeImpersonation')
      await controller.getSchoolImpersonation(req, res, next)
      expect(schoolImpersonationService.removeImpersonation).toHaveBeenCalled()
    })
    it('should render the school impersonation form', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(res, 'render')
      spyOn(schoolImpersonationService, 'removeImpersonation')
      await controller.getSchoolImpersonation(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('postSchoolImpersonation', () => {
    const reqParams = {
      method: 'POST',
      url: '/school-impersonation',
      body: { dfeNumber: '1230000' }
    }
    it('should call schoolImpersonationService.validateImpersonationForm method to validate dfeNumber given and create an impersonation', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(schoolImpersonationService, 'validateImpersonationForm')
      await controller.postSchoolImpersonation(req, res, next)
      expect(schoolImpersonationService.validateImpersonationForm).toHaveBeenCalled()
    })
    it('should render the helpdesk home if no validation error occurred', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(res, 'redirect')
      spyOn(schoolImpersonationService, 'validateImpersonationForm').and.returnValue({ School: '1230000' })
      await controller.postSchoolImpersonation(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })
    it('should re-render the helpdesk impersonation form if a validation error occurred', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      const validationError = new ValidationError()
      validationError.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationService, 'validateImpersonationForm').and.returnValue(validationError)
      spyOn(controller, 'getSchoolImpersonation')
      spyOn(res, 'render')
      await controller.postSchoolImpersonation(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(controller.getSchoolImpersonation).toHaveBeenCalled()
    })
  })
  describe('getSchoolLandingPage', () => {
    const reqParams = {
      method: 'GET',
      url: '/home'
    }
    it('should display the \'school landing page\'', async () => {
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({})
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
      spyOn(schoolService, 'findSchoolByDfeNumber').and.returnValue(schoolMock)
      spyOn(pupilRegisterService, 'hasIncompleteChecks').and.returnValue(false)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible')
      const res = getRes()
      const req = getReq(reqParams)
      await controller.getSchoolLandingPage(req, res, next)
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
      expect(schoolService.findSchoolByDfeNumber).toHaveBeenCalled()
      expect(pupilRegisterService.hasIncompleteChecks).toHaveBeenCalled()
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe('MTC Helpdesk Homepage')
      expect(next).not.toHaveBeenCalled()
    })
    it('should throw an error if getActiveCheckWindow method throws an error', async () => {
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue((Promise.reject(new Error('error'))))
      spyOn(schoolService, 'findSchoolByDfeNumber').and.returnValue(schoolMock)
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
      spyOn(pupilRegisterService, 'hasIncompleteChecks').and.returnValue(false)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible')
      const res = getRes()
      const req = getReq(reqParams)
      await controller.getSchoolLandingPage(req, res, next)
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(schoolService.findSchoolByDfeNumber).not.toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
      expect(pupilRegisterService.hasIncompleteChecks).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
