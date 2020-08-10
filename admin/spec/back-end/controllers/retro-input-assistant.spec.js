'use strict'

/* global describe beforeEach it expect jasmine spyOn fail */

const httpMocks = require('node-mocks-http')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const sut = require('../../../controllers/retro-input-assistant')
const businessAvailabilityService = require('../../../services/business-availability.service')
const retroInputAssistantService = require('../../../services/retro-input-assistant.service')

describe('retro input assistant controller:', () => {
  let next

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

  beforeEach(() => {
    next = jasmine.createSpy('next')
  })

  describe('getAddRetroInputAssistant route', () => {
    const reqParams = () => {
      return {
        method: 'GET',
        url: '/access-arrangements/retro-add-input-assistant'
      }
    }
    it('displays the retro input assistant page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({
        hdfSubmitted: false
      })
      spyOn(retroInputAssistantService, 'getEligiblePupilsWithFullNames')
      await sut.getAddRetroInputAssistant(req, res, next)
      expect(res.locals.pageTitle).toBe('Record input assistant used for official check')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(retroInputAssistantService.getEligiblePupilsWithFullNames).toHaveBeenCalled()
    })
    it('throws an error if access is attempted when the hdf has been signed', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({
        hdfSubmitted: true
      })
      try {
        await sut.getAddRetroInputAssistant(req, res, next)
        fail('error should have been thrown')
      } catch (error) {
        expect(error.name).toBe('AccessArrangementsNotEditableError')
      }
    })
    it('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({
        hdfSubmitted: false
      })
      const error = new Error('error')
      spyOn(retroInputAssistantService, 'getEligiblePupilsWithFullNames').and.throwError(error)
      await sut.getAddRetroInputAssistant(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('postSubmitRetroInputAssistant route', () => {
    const reqParams = () => {
      return {
        method: 'POST',
        url: '/access-arrangements/retro-add-input-assistant'
      }
    }
    it('passes the request body to service for processing and redirects', async () => {
      const req = getReq(reqParams)
      req.body.pupilUrlSlug = 'slug'
      const res = getRes()
      spyOn(res, 'redirect')
      spyOn(retroInputAssistantService, 'save')
      await sut.postSubmitRetroInputAssistant(req, res, next)
      expect(retroInputAssistantService.save).toHaveBeenCalledTimes(1)
      expect(res.redirect).toHaveBeenCalledWith('/access-arrangements/overview?hl=slug')
    })
  })
})
