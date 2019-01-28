'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

const controller = require('../../../controllers/attendance')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const attendanceCodeService = require('../../../services/attendance.service')
const hdfValidator = require('../../../lib/validator/hdf-validator')
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
        pupilId: 1
      }
    }

    it('renders the edit attendance reason page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(headteacherDeclarationService, 'findPupilByIdAndDfeNumber').and.returnValue({})
      spyOn(attendanceCodeService, 'getAttendanceCodes').and.returnValue([])
      spyOn(res, 'render').and.returnValue(null)
      await controller.getEditReason(req, res)
      expect(headteacherDeclarationService.findPupilByIdAndDfeNumber).toHaveBeenCalled()
      expect(attendanceCodeService.getAttendanceCodes).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('postSubmitEditReason', () => {
    let reqParams = {
      method: 'POST',
      url: '/attendance/submit-edit-reason-form',
      body: { pupilId: 99, attendanceCode: 'XXX' },
      user: { id: 1, School: 1 }
    }

    it('redirects to the review pupils page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(headteacherDeclarationService, 'findPupilByIdAndDfeNumber').and.returnValue({ id: reqParams.body.pupilId })
      spyOn(headteacherDeclarationService, 'updatePupilsAttendanceCode').and.returnValue(null)
      spyOn(res, 'redirect')
      await controller.postSubmitEditReason(req, res)
      expect(headteacherDeclarationService.findPupilByIdAndDfeNumber).toHaveBeenCalled()
      expect(headteacherDeclarationService.updatePupilsAttendanceCode).toHaveBeenCalledWith(
        [reqParams.body.pupilId],
        reqParams.body.attendanceCode,
        reqParams.user.id
      )
      expect(req.flash).toHaveBeenCalledTimes(2)
      expect(res.redirect).toHaveBeenCalled()
    })
  })
})
