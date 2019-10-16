'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const R = require('ramda')

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const controller = require('../../../controllers/access-arrangements')
const accessArrangementsService = require('../../../services/access-arrangements.service')
const pupilAccessArrangementsService = require('../../../services/pupil-access-arrangements.service')
const pupilAccessArrangementsEditService = require('../../../services/pupil-access-arrangements-edit.service')
const questionReaderReasonsService = require('../../../services/question-reader-reasons.service')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const accessArrangementsOverviewPresenter = require('../../../helpers/access-arrangements-overview-presenter')
const businessAvailabilityService = require('../../../services/business-availability.service')
const ValidationError = require('../../../lib/validation-error')

describe('access arrangements controller:', () => {
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

  describe('getOverview route', () => {
    const reqParams = {
      method: 'GET',
      url: '/access-arrangements/overview'
    }

    it('displays the access arrangements overview page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(pupilAccessArrangementsService, 'getPupils').and.returnValue([])
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ accessArrangementsAvailable: true })
      spyOn(accessArrangementsOverviewPresenter, 'getPresentationData')
      await controller.getOverview(req, res, next)
      expect(res.locals.pageTitle).toBe('Access arrangements')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
      expect(accessArrangementsOverviewPresenter.getPresentationData).toHaveBeenCalled()
    })
    it('throws an error if pupilAccessArrangementsService getPupils is rejected', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(pupilAccessArrangementsService, 'getPupils').and.returnValue(Promise.reject(new Error('error')))
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData')
      try {
        await controller.getOverview(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.render).not.toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
    })
  })
  describe('getSelectAccessArrangements route', () => {
    const reqParams = {
      method: 'GET',
      url: '/access-arrangements/select-access-arrangements'
    }

    it('displays the select access arrangements page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(accessArrangementsService, 'getAccessArrangements')
      spyOn(questionReaderReasonsService, 'getQuestionReaderReasons')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ accessArrangementsAvailable: true })
      spyOn(pupilAccessArrangementsService, 'getEligiblePupilsWithFullNames')
      await controller.getSelectAccessArrangements(req, res, next)
      expect(res.locals.pageTitle).toBe('Select access arrangement for pupil')
      expect(res.render).toHaveBeenCalled()
      expect(accessArrangementsService.getAccessArrangements).toHaveBeenCalled()
      expect(questionReaderReasonsService.getQuestionReaderReasons).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      expect(pupilAccessArrangementsService.getEligiblePupilsWithFullNames).toHaveBeenCalled()
    })
    it('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      const error = new Error('error')
      spyOn(accessArrangementsService, 'getAccessArrangements').and.returnValue(Promise.reject(error))
      spyOn(questionReaderReasonsService, 'getQuestionReaderReasons')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData')
      spyOn(pupilAccessArrangementsService, 'getEligiblePupilsWithFullNames')
      await controller.getSelectAccessArrangements(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(questionReaderReasonsService.getQuestionReaderReasons).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      expect(pupilAccessArrangementsService.getEligiblePupilsWithFullNames).not.toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
    })
  })
  describe('postSubmitAccessArrangements route', () => {
    const reqParams = {
      method: 'POST',
      url: '/access-arrangements/submit',
      body: {
      },
      user: {
        id: 1,
        School: 1
      }
    }
    it('submits pupils access arrangements', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(accessArrangementsService, 'submit').and.returnValue({ id: 1, foreName: 'foreName', lastName: 'lastName' })
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      await controller.postSubmitAccessArrangements(req, res, next)
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.determineAccessArrangementsEligibility).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
      expect(accessArrangementsService.submit).toHaveBeenCalled()
    })
    it('calls next if accessArrangementsService submit throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      const error = new Error('error')
      spyOn(accessArrangementsService, 'submit').and.returnValue(Promise.reject(error))
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
    it('calls getSelectAccessArrangements if accessArrangementsService submit throws a validation Error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(controller, 'getSelectAccessArrangements')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(accessArrangementsService, 'submit').and.returnValue(Promise.reject(new ValidationError()))
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(controller.getSelectAccessArrangements).toHaveBeenCalled()
    })
    it('calls getEditAccessArrangements if accessArrangementsService submit throws a validation Error on edit view', async () => {
      const reqParamsClone = R.clone(reqParams)
      reqParamsClone.body = {
        isEditView: 'true'
      }
      const res = getRes()
      const req = getReq(reqParamsClone)
      spyOn(res, 'redirect')
      spyOn(controller, 'getSelectAccessArrangements')
      spyOn(controller, 'getEditAccessArrangements')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(accessArrangementsService, 'submit').and.returnValue(Promise.reject(new ValidationError()))
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(controller.getSelectAccessArrangements).not.toHaveBeenCalled()
      expect(controller.getEditAccessArrangements).toHaveBeenCalled()
    })
  })
  describe('getEditAccessArrangements route', () => {
    const reqParams = (urlSlug) => {
      return {
        method: 'GET',
        url: `/access-arrangements/select-access-arrangements/${urlSlug}`,
        params: {
          pupilUrlSlug: 'pupilUrlSlug'
        }
      }
    }
    it('displays the edit access arrangements page', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      spyOn(res, 'render')
      spyOn(accessArrangementsService, 'getAccessArrangements')
      spyOn(questionReaderReasonsService, 'getQuestionReaderReasons')
      spyOn(pupilAccessArrangementsEditService, 'getEditData')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      await controller.getEditAccessArrangements(req, res, next)
      expect(res.locals.pageTitle).toBe('Edit access arrangement for pupil')
      expect(res.render).toHaveBeenCalled()
      expect(accessArrangementsService.getAccessArrangements).toHaveBeenCalled()
      expect(pupilAccessArrangementsEditService.getEditData).toHaveBeenCalledWith({}, 'pupilUrlSlug', 9991001)
    })
    it('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      spyOn(res, 'render')
      const error = new Error('error')
      spyOn(accessArrangementsService, 'getAccessArrangements')
      spyOn(questionReaderReasonsService, 'getQuestionReaderReasons')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(pupilAccessArrangementsEditService, 'getEditData').and.returnValue(Promise.reject(error))
      await controller.getEditAccessArrangements(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('getDeleteAccessArrangements route', () => {
    const reqParams = (urlSlug) => {
      return {
        method: 'GET',
        url: `/access-arrangements/delete-access-arrangements/${urlSlug}`,
        params: {
          pupilUrlSlug: 'pupilUrlSlug'
        }
      }
    }
    it('redirects to overview page when successfully deleting', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      spyOn(res, 'redirect')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility')
      spyOn(pupilAccessArrangementsService, 'deletePupilAccessArrangements').and.returnValue({ id: 1, foreName: 'foreName', lastName: 'lastName' })
      await controller.getDeleteAccessArrangements(req, res, next)
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
      const error = new Error('error')
      spyOn(pupilAccessArrangementsService, 'deletePupilAccessArrangements').and.returnValue(Promise.reject(error))
      await controller.getDeleteAccessArrangements(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
