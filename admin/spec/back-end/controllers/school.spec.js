'use strict'

/* global describe beforeEach afterEach expect spyOn jest test */

const httpMocks = require('node-mocks-http')

const administrationMessageService = require('../../../services/administration-message.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const helpdeskService = require('../../../services/helpdesk.service')
const liveCheckWindowMock = require('../mocks/check-window').liveCheckWindow
const resultPageAvailabilityService = require('../../../services/results-page-availability.service')
const schoolController = require('../../../controllers/school')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const schoolMock = require('../mocks/school')
const schoolService = require('../../../services/school.service')

describe('school controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991001 }
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  describe('Check routes', () => {
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/school/school-home'
    }

    beforeEach(() => {
      next = jest.fn()
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockReturnValue(undefined)
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(undefined)
      jest.spyOn(administrationMessageService, 'getMessage').mockResolvedValue(undefined)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    describe('#getSchoolLandingPage', () => {
      test('it should display the \'school landing page\'', async () => {
        jest.spyOn(helpdeskService, 'isHelpdeskRole').mockReturnValue(false)
        jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(liveCheckWindowMock)
        jest.spyOn(schoolService, 'findSchoolNameByDfeNumber').mockReturnValue(schoolMock)
        jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
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

      test('it should throw an error if getActiveCheckWindow method throws an error', async () => {
        jest.spyOn(helpdeskService, 'isHelpdeskRole').mockReturnValue(false)
        jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockRejectedValue(new Error('mock error'))
        const res = getRes()
        const req = getReq(goodReqParams)
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })

      test('it should redirect to school impersonation form if a helpdesk user with no impersonation lands attempts' +
        ' to access school home page', async () => {
        jest.spyOn(helpdeskService, 'isHelpdeskRole').mockReturnValue(true)
        jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'redirect')
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(res.redirect).toHaveBeenCalled()
      })

      test('it should call administrationMessageService.getMessage to fetch a potential service message', async () => {
        jest.spyOn(helpdeskService, 'isHelpdeskRole').mockReturnValue(false)
        jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockReturnValue(liveCheckWindowMock)
        jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
        jest.spyOn(schoolService, 'findSchoolNameByDfeNumber').mockReturnValue(schoolMock)
        jest.spyOn(administrationMessageService, 'getMessage')
        const res = getRes()
        const req = getReq(goodReqParams)
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(administrationMessageService.getMessage).toHaveBeenCalled()
      })
    })
  })
})
