'use strict'

/* global describe beforeEach afterEach it expect jasmine spyOn */

const sinon = require('sinon')
const httpMocks = require('node-mocks-http')

const schoolController = require('../../../controllers/school')
const schoolService = require('../../../services/school.service')
const schoolHomePinGenerationEligibilityPresenter = require('../../../helpers/school-home-pin-generation-eligibility-presenter')
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
    let goodReqParams = {
      method: 'GET',
      url: '/school/school-home'
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('#getSchoolLandingPage', () => {
      it('should display the \'school landing page\'', async (done) => {
        spyOn(schoolHomePinGenerationEligibilityPresenter, 'getEligibilityData')
        spyOn(schoolService, 'findSchoolByDfeNumber').and.returnValue(schoolMock)
        const res = getRes()
        const req = getReq(goodReqParams)
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(schoolHomePinGenerationEligibilityPresenter.getEligibilityData).toHaveBeenCalled()
        expect(schoolService.findSchoolByDfeNumber).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('School Homepage')
        expect(next).not.toHaveBeenCalled()
        done()
      })
      it('should throw an error if getEligibilityData method throws an error', async () => {
        spyOn(schoolHomePinGenerationEligibilityPresenter, 'getEligibilityData').and.returnValue(Promise.reject(new Error('error')))
        spyOn(schoolService, 'findSchoolByDfeNumber').and.returnValue(schoolMock)
        const res = getRes()
        const req = getReq(goodReqParams)
        await schoolController.getSchoolLandingPage(req, res, next)
        expect(schoolHomePinGenerationEligibilityPresenter.getEligibilityData).toHaveBeenCalled()
        expect(schoolService.findSchoolByDfeNumber).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })
  })
})
