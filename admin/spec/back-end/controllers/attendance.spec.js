'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

const controller = require('../../../controllers/attendance')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const attendanceCodeService = require('../../../services/attendance.service')
const hdfValidator = require('../../../lib/validator/hdf-validator')
const hdfConfirmValidator = require('../../../lib/validator/hdf-confirm-validator')
const ValidationError = require('../../../lib/validation-error')

describe('attendance controller:', () => {
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

  describe('getDeclarationForm', () => {
    let goodReqParams = {
      method: 'GET',
      url: '/attendance/declaration-form',
      params: {}
    }

    it('renders the declaration form page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(res, 'render').and.returnValue(null)
      await controller.getDeclarationForm(req, res)
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('postDeclarationForm route', () => {
    let reqParams = {
      method: 'POST',
      url: '/attendance/submit-declaration-form',
      body: {},
      user: { id: 1, School: 9991001 }
    }

    it('redirects to the submit attendance page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
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
    let goodReqParams = {
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
    let goodReqParams = {
      method: 'GET',
      url: '/attendance/edit-reason/1',
      params: {
        urlSlug: 'xxx-xxx-xxx-xxx'
      }
    }

    it('renders the edit attendance reason page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(headteacherDeclarationService, 'findPupilBySlugAndDfeNumber').and.returnValue({})
      spyOn(attendanceCodeService, 'getAttendanceCodes').and.returnValue([])
      spyOn(res, 'render').and.returnValue(null)
      await controller.getEditReason(req, res)
      expect(headteacherDeclarationService.findPupilBySlugAndDfeNumber).toHaveBeenCalled()
      expect(attendanceCodeService.getAttendanceCodes).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('postSubmitEditReason', () => {
    let reqParams = {
      method: 'POST',
      url: '/attendance/submit-edit-reason',
      body: { urlSlug: 'xxx-xxx-xxx-xxx', attendanceCode: 'XXX' },
      user: { id: 1, School: 1 }
    }

    it('redirects to the review pupils page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(headteacherDeclarationService, 'findPupilBySlugAndDfeNumber').and.returnValue({ id: 1 })
      spyOn(headteacherDeclarationService, 'updatePupilsAttendanceCode').and.returnValue(null)
      spyOn(res, 'redirect')
      await controller.postSubmitEditReason(req, res)
      expect(headteacherDeclarationService.findPupilBySlugAndDfeNumber).toHaveBeenCalled()
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
    let goodReqParams = {
      method: 'GET',
      url: '/attendance/confirm-and-submit'
    }

    it('renders the confirm and submit page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.returnValue(null)
      await controller.getConfirmSubmit(req, res)
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('postConfirmSubmit', () => {
    let reqParams = {
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
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue({})
      spyOn(headteacherDeclarationService, 'submitDeclaration').and.returnValue({})
      await controller.postConfirmSubmit(req, res)
      expect(hdfValidator.validate).toHaveBeenCalled()
      expect(headteacherDeclarationService.getEligibilityForSchool).toHaveBeenCalled()
      expect(headteacherDeclarationService.submitDeclaration).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    it('renders confirm and submit form if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const validationError = new ValidationError()
      validationError.addError('confirmBoxes', true)
      spyOn(hdfConfirmValidator, 'validate').and.returnValue(validationError)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      await controller.postConfirmSubmit(req, res)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
      expect(res.error).toEqual(validationError)
    })
  })
})
