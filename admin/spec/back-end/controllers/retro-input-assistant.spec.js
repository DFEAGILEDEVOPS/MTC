'use strict'

/* global describe beforeEach it expect jasmine spyOn fail */

const httpMocks = require('node-mocks-http')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const sut = require('../../../controllers/retro-input-assistant')
const businessAvailabilityService = require('../../../services/business-availability.service')
const retroInputAssistantService = require('../../../services/retro-input-assistant.service')
const accessArrangementsService = require('../../../services/access-arrangements.service')
const aaViewModes = require('../../../lib/consts/access-arrangements-view-mode')
const { AccessArrangementsNotEditableError } = require('../../../error-types/access-arrangements-not-editable-error')

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
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(accessArrangementsService, 'getCurrentViewMode').and.returnValue(aaViewModes.edit)
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
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(accessArrangementsService, 'getCurrentViewMode').and.returnValue(aaViewModes.edit)
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
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(accessArrangementsService, 'getCurrentViewMode').and.returnValue(aaViewModes.edit)
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

  describe('getDeleteRetroInputAssistant route', () => {
    const reqParams = (urlSlug) => {
      return {
        method: 'GET',
        url: `/access-arrangements/delete-retro-input-assistant/${urlSlug}`,
        params: {
          pupilUrlSlug: 'pupilUrlSlug'
        }
      }
    }

    it('redirects to error page if edit mode not available', async () => {
      spyOn(accessArrangementsService, 'getCurrentViewMode').and.returnValue(aaViewModes.readonly)
      const req = getReq(reqParams)
      const res = getRes()
      await sut.getDeleteRetroInputAssistant(req, res, next)
      expect(next).toHaveBeenCalledWith(new AccessArrangementsNotEditableError())
    })
    it('redirects to overview page when successfully deleting', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      spyOn(res, 'redirect')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(accessArrangementsService, 'getCurrentViewMode').and.returnValue(aaViewModes.edit)
      spyOn(retroInputAssistantService, 'deleteFromCurrentCheck')
      await sut.getDeleteRetroInputAssistant(req, res, next)
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.determineAccessArrangementsEligibility).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })
    it('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      spyOn(res, 'redirect')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(accessArrangementsService, 'getCurrentViewMode').and.returnValue(aaViewModes.edit)
      const error = new Error('error')
      spyOn(retroInputAssistantService, 'deleteFromCurrentCheck').and.returnValue(Promise.reject(error))
      await sut.getDeleteRetroInputAssistant(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
