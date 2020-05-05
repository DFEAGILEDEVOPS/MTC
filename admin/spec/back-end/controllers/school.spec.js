'use strict'

/* global describe beforeEach afterEach it expect jasmine spyOn */

const sinon = require('sinon')
const httpMocks = require('node-mocks-http')

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const helpdeskService = require('../../../services/helpdesk.service')
const schoolController = require('../../../controllers/school')
const schoolService = require('../../../services/school.service')
const resultPageAvailabilityService = require('../../../services/results-page-availability.service')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const administrationMessageService = require('../../../services/administration-message.service')
const schoolMock = require('../mocks/school')

describe('school controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991001 }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('Check routes', () => {
    let sandbox
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/school/school-home'
    }

    beforeEach(() => {
      sandbox = sinon.createSandbox()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('#getSchoolLandingPage', () => {
      it('should display the \'school landing page\'', async () => {
        spyOn(helpdeskService, 'isHelpdeskRole').and.returnValue(false)
        spyOn(helpdeskService, 'isImpersonating').and.returnValue(false)
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({})
        spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
        spyOn(schoolService, 'findSchoolNameByDfeNumber').and.returnValue(schoolMock)
        spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
        spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible')
        spyOn(administrationMessageService, 'getMessage')
        const res = getRes()
        const req = getReq(goodReqParams)
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
        expect(schoolService.findSchoolNameByDfeNumber).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('School Homepage')
        expect(next).not.toHaveBeenCalled()
      })
      it('should throw an error if getActiveCheckWindow method throws an error', async () => {
        spyOn(helpdeskService, 'isHelpdeskRole').and.returnValue(false)
        spyOn(helpdeskService, 'isImpersonating').and.returnValue(false)
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue((Promise.reject(new Error('error'))))
        spyOn(schoolService, 'findSchoolNameByDfeNumber').and.returnValue(schoolMock)
        spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
        spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
        spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible')
        const res = getRes()
        const req = getReq(goodReqParams)
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(schoolService.findSchoolNameByDfeNumber).not.toHaveBeenCalled()
        expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
      it('should redirect to school impersonation form if a helpdesk user with no impersonation lands attempts to access school home page', async () => {
        spyOn(helpdeskService, 'isHelpdeskRole').and.returnValue(true)
        spyOn(helpdeskService, 'isImpersonating').and.returnValue(false)
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'redirect')
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(res.redirect).toHaveBeenCalled()
      })
      it('should call administrationMessageService.getMessage to fetch a potential service message', async () => {
        spyOn(helpdeskService, 'isHelpdeskRole').and.returnValue(false)
        spyOn(helpdeskService, 'isImpersonating').and.returnValue(false)
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({})
        spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
        spyOn(schoolService, 'findSchoolNameByDfeNumber').and.returnValue(schoolMock)
        spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
        spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible')
        spyOn(administrationMessageService, 'getMessage')
        const res = getRes()
        const req = getReq(goodReqParams)
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(administrationMessageService.getMessage).toHaveBeenCalled()
      })
    })
  })
})
