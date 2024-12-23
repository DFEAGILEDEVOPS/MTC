'use strict'

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
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  beforeEach(() => {
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getAddRetroInputAssistant route', () => {
    const reqParams = () => {
      return {
        method: 'GET',
        url: '/access-arrangements/retro-add-input-assistant'
      }
    }
    test('displays the retro input assistant page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({
        hdfSubmitted: false
      })
      jest.spyOn(retroInputAssistantService, 'getEligiblePupilsWithFullNames').mockImplementation()
      await sut.getAddRetroInputAssistant(req, res, next)
      expect(res.locals.pageTitle).toBe('Record input assistant used for official check')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(retroInputAssistantService.getEligiblePupilsWithFullNames).toHaveBeenCalled()
    })
    test('throws an error if access is attempted when the hdf has been signed', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({
        hdfSubmitted: true
      })
      try {
        await sut.getAddRetroInputAssistant(req, res, next)
        fail('error should have been thrown')
      } catch (error) {
        expect(error.name).toBe('AccessArrangementsNotEditableError')
      }
    })
    test('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({
        hdfSubmitted: false
      })
      const error = new Error('error')
      jest.spyOn(retroInputAssistantService, 'getEligiblePupilsWithFullNames').mockRejectedValue(error)
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
    test('passes the request body to service for processing and redirects', async () => {
      const req = getReq(reqParams)
      req.body.pupilUrlSlug = 'slug'
      const res = getRes()
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(retroInputAssistantService, 'save').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
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

    test('redirects to error page if edit mode not available', async () => {
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.readonly)
      const req = getReq(reqParams)
      const res = getRes()
      await sut.getDeleteRetroInputAssistant(req, res, next)
      expect(next).toHaveBeenCalledWith(new AccessArrangementsNotEditableError())
    })
    test('redirects to overview page when successfully deleting', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(retroInputAssistantService, 'deleteFromCurrentCheck').mockImplementation()
      await sut.getDeleteRetroInputAssistant(req, res, next)
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.determineAccessArrangementsEligibility).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })
    test('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      const error = new Error('error')
      jest.spyOn(retroInputAssistantService, 'deleteFromCurrentCheck').mockResolvedValue(Promise.reject(error))
      await sut.getDeleteRetroInputAssistant(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
