'use strict'

/* global describe it expect jasmine spyOn beforeEach */

const httpMocks = require('node-mocks-http')
const moment = require('moment')

const businessAvailabilityService = require('../../../services/business-availability.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const controller = require('../../../controllers/attendance')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const attendanceCodeService = require('../../../services/attendance.service')
const hdfValidator = require('../../../lib/validator/hdf-validator')
const hdfConfirmValidator = require('../../../lib/validator/hdf-confirm-validator')
const ValidationError = require('../../../lib/validation-error')

describe('attendance controller:', () => {
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

  describe('getDeclarationForm', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/declaration-form',
      params: {}
    }

    it('renders the declaration form page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ checkEndDate: 'value' })
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfAvailable: true })
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(false)
      spyOn(res, 'render').and.returnValue(null)
      await controller.getDeclarationForm(req, res)
      expect(res.render).toHaveBeenCalled()
    })

    it('redirects when the hdf has been submitted', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfAvailable: true })
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      await controller.getDeclarationForm(req, res)
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })
    it('renders section unavailable when hdf is not available', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfAvailable: false })
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      await controller.getDeclarationForm(req, res)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('availability/section-unavailable', (
        {
          title: "Headteacher's declaration form",
          breadcrumbs: undefined
        })
      )
    })
  })

  describe('postDeclarationForm route', () => {
    const reqParams = {
      method: 'POST',
      url: '/attendance/submit-declaration-form',
      body: {},
      user: { id: 1, School: 9991001 }
    }

    it('redirects to the submit attendance page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ checkEndDate: 'value' })
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(hdfValidator, 'validate').and.returnValue(new ValidationError())
      await controller.postDeclarationForm(req, res)
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    it('renders declaration form if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const validationError = new ValidationError()
      validationError.addError('firstName', true)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ checkEndDate: 'value' })
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(hdfValidator, 'validate').and.returnValue(validationError)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      await controller.postDeclarationForm(req, res)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('getReviewPupilDetails', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/review-pupil-details',
      params: {}
    }

    it('renders the pupil details list page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(headteacherDeclarationService, 'findPupilsForSchool').and.returnValue([])
      spyOn(res, 'render').and.returnValue(null)
      await controller.getReviewPupilDetails(req, res)
      expect(headteacherDeclarationService.findPupilsForSchool).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('getEditReason', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/edit-reason/1',
      params: {
        urlSlug: 'xxx-xxx-xxx-xxx'
      }
    }

    it('renders the edit attendance reason page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(headteacherDeclarationService, 'findPupilBySlugAndSchoolId').and.returnValue({})
      spyOn(attendanceCodeService, 'getAttendanceCodes').and.returnValue([])
      spyOn(res, 'render').and.returnValue(null)
      await controller.getEditReason(req, res)
      expect(headteacherDeclarationService.findPupilBySlugAndSchoolId).toHaveBeenCalled()
      expect(attendanceCodeService.getAttendanceCodes).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('postSubmitEditReason', () => {
    const reqParams = {
      method: 'POST',
      url: '/attendance/submit-edit-reason',
      body: { urlSlug: 'xxx-xxx-xxx-xxx', attendanceCode: 'XXX' },
      user: { id: 1, School: 1 }
    }

    it('redirects to the review pupils page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(headteacherDeclarationService, 'findPupilBySlugAndSchoolId').and.returnValue({ id: 1 })
      spyOn(headteacherDeclarationService, 'updatePupilsAttendanceCode').and.returnValue(null)
      spyOn(res, 'redirect')
      await controller.postSubmitEditReason(req, res)
      expect(headteacherDeclarationService.findPupilBySlugAndSchoolId).toHaveBeenCalled()
      expect(headteacherDeclarationService.updatePupilsAttendanceCode).toHaveBeenCalledWith(
        [1],
        reqParams.body.attendanceCode,
        reqParams.user.id
      )
      expect(req.flash).toHaveBeenCalledTimes(2)
      expect(res.redirect).toHaveBeenCalled()
    })
  })

  describe('getConfirmSubmit', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/confirm-and-submit'
    }

    it('renders the confirm and submit page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ checkEndDate: 'value' })
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfAvailable: true })
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(res, 'render').and.returnValue(null)
      await controller.getConfirmSubmit(req, res)
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
    })
    it('calls next if a service method throws', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const error = new Error('error')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(Promise.reject(error))
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(businessAvailabilityService, 'getAvailabilityData')
      spyOn(res, 'render')
      await controller.getConfirmSubmit(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
    it('renders declaration form page to display unavailable content when hdf eligibility is false ', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ checkEndDate: 'value' })
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(false)
      spyOn(businessAvailabilityService, 'getAvailabilityData')
      spyOn(res, 'render')
      await controller.getConfirmSubmit(req, res, next)
      expect(res.render).toHaveBeenCalledWith('hdf/declaration-form', (
        {
          hdfEligibility: false,
          formData: {},
          error: new ValidationError(),
          breadcrumbs: undefined
        })
      )
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('postConfirmSubmit', () => {
    const reqParams = {
      method: 'POST',
      url: '/attendance/confirm-and-submit',
      session: { hdfFormData: { isHeadTeacher: 'Y', firstName: 'Bob', lastName: 'Jones' } },
      body: {
        confirm: 'Y',
        pupilDetails: 'checked',
        uniquePins: 'checked',
        staffConfirm: 'checked'
      }
    }

    it('redirects to the submitted page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(hdfConfirmValidator, 'validate').and.returnValue(new ValidationError())
      spyOn(hdfValidator, 'validate').and.returnValue(new ValidationError())
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ checkEndDate: 'value' })
      spyOn(headteacherDeclarationService, 'submitDeclaration').and.returnValue({})
      await controller.postConfirmSubmit(req, res)
      expect(hdfValidator.validate).toHaveBeenCalled()
      expect(headteacherDeclarationService.submitDeclaration).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    it('renders confirm and submit form if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const validationError = new ValidationError()
      validationError.addError('confirmBoxes', true)
      spyOn(hdfConfirmValidator, 'validate').and.returnValue(validationError)
      spyOn(controller, 'getConfirmSubmit')
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      await controller.postConfirmSubmit(req, res)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(controller.getConfirmSubmit).toHaveBeenCalled()
      expect(res.error).toEqual(validationError)
    })
  })

  describe('getHDFSubmitted', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/submitted'
    }

    it('redirects to the submit page if there is no HDF', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(res, 'render').and.returnValue(null)
      spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').and.returnValue(false)
      await controller.getHDFSubmitted(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/attendance/declaration-form')
      expect(res.render).not.toHaveBeenCalled()
    })

    it('renders the submitted page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.returnValue(null)
      spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').and.returnValue({
        signedDate: moment(),
        checkEndDate: moment()
      })
      await controller.getHDFSubmitted(req, res)
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('getHDFSubmittedForm', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/submitted-form'
    }

    it('redirects to the submit page if there is no HDF', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(res, 'render').and.returnValue(null)
      spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').and.returnValue(false)
      await controller.getHDFSubmittedForm(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/attendance/declaration-form')
      expect(res.render).not.toHaveBeenCalled()
    })

    it('renders the submitted form page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.returnValue(null)
      spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').and.returnValue({
        signedDate: moment()
      })
      await controller.getHDFSubmittedForm(req, res)
      expect(res.render).toHaveBeenCalled()
    })
  })
})
