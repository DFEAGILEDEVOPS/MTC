'use strict'

const httpMocks = require('node-mocks-http')
const moment = require('moment')

const businessAvailabilityService = require('../../../services/business-availability.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const sut = require('../../../controllers/hdf')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const attendanceCodeService = require('../../../services/attendance.service')
const hdfValidator = require('../../../lib/validator/hdf-validator')
const hdfConfirmValidator = require('../../../lib/validator/hdf-confirm-validator')
const ValidationError = require('../../../lib/validation-error')
const dateService = require('../../../services/date.service')

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

  describe('getDeclarationForm', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/declaration-form',
      params: {}
    }

    test('renders the declaration form page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ checkEndDate: 'value' })
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(true)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfAvailable: true })
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getDeclarationForm(req, res)
      expect(res.render).toHaveBeenCalled()
    })

    test('redirects when the hdf has been submitted', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(true)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfAvailable: true })
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getDeclarationForm(req, res)
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })
    test('renders section unavailable when hdf is not available', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(true)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfAvailable: false })
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getDeclarationForm(req, res)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('availability/section-unavailable', (
        {
          title: 'Headteacher\'s declaration form',
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

    test('redirects to the submit attendance page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ checkEndDate: 'value' })
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(hdfValidator, 'validate').mockResolvedValue(new ValidationError())
      await sut.postDeclarationForm(req, res)
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    test('renders declaration form if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const validationError = new ValidationError()
      validationError.addError('firstName', true)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ checkEndDate: 'value' })
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(true)
      jest.spyOn(hdfValidator, 'validate').mockResolvedValue(validationError)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.postDeclarationForm(req, res)
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

    test('renders the pupil details list page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(headteacherDeclarationService, 'findPupilsForSchool').mockResolvedValue([])
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getReviewPupilDetails(req, res)
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

    test('renders the edit attendance reason page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(headteacherDeclarationService, 'findPupilBySlugAndSchoolId').mockResolvedValue({})
      jest.spyOn(attendanceCodeService, 'getAttendanceCodes').mockResolvedValue([])
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getEditReason(req, res)
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
      user: { id: 1, School: 1, schoolId: 2, role: 'TEACHER' }
    }

    test('redirects to the review pupils page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(headteacherDeclarationService, 'findPupilBySlugAndSchoolId').mockResolvedValue({ pupilId: 1 })
      jest.spyOn(headteacherDeclarationService, 'updatePupilsAttendanceCode').mockResolvedValue(null)
      jest.spyOn(res, 'redirect').mockImplementation()
      await sut.postSubmitEditReason(req, res)
      expect(headteacherDeclarationService.findPupilBySlugAndSchoolId).toHaveBeenCalled()
      expect(headteacherDeclarationService.updatePupilsAttendanceCode).toHaveBeenCalledWith(
        [1],
        reqParams.body.attendanceCode,
        reqParams.user.id,
        reqParams.user.schoolId,
        reqParams.user.role
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

    test('renders the confirm and submit page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ checkEndDate: 'value' })
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfAvailable: true })
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(true)
      jest.spyOn(res, 'render').mockResolvedValue(null)
      await sut.getConfirmSubmit(req, res)
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
    })
    test('calls next if a service method throws', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const error = new Error('error')
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(Promise.reject(error))
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(true)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getConfirmSubmit(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
    test('renders declaration form page to display unavailable content when hdf eligibility is false ', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const checkEndDate = new Date('2001-01-01')
      const formattedCheckEndDate = dateService.formatDayAndDate(checkEndDate)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ checkEndDate })
      jest.spyOn(headteacherDeclarationService, 'getEligibilityForSchool').mockResolvedValue(false)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getConfirmSubmit(req, res, next)
      expect(res.render).toHaveBeenCalledWith('hdf/declaration-form', (
        {
          hdfEligibility: false,
          formData: {},
          checkEndDate: formattedCheckEndDate,
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

    test('redirects to the submitted page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(hdfConfirmValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(hdfValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ checkEndDate: 'value' })
      jest.spyOn(headteacherDeclarationService, 'submitDeclaration').mockResolvedValue({})
      await sut.postConfirmSubmit(req, res)
      expect(hdfValidator.validate).toHaveBeenCalled()
      expect(headteacherDeclarationService.submitDeclaration).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    test('renders confirm and submit form if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const validationError = new ValidationError()
      validationError.addError('confirmBoxes', true)
      jest.spyOn(hdfConfirmValidator, 'validate').mockResolvedValue(validationError)
      jest.spyOn(sut, 'getConfirmSubmit').mockImplementation()
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.postConfirmSubmit(req, res)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(sut.getConfirmSubmit).toHaveBeenCalled()
      expect(res.error).toEqual(validationError)
    })
  })

  describe('getHDFSubmitted', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/submitted'
    }

    test('redirects to the submit page if there is no HDF', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').mockResolvedValue(false)
      await sut.getHDFSubmitted(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/attendance/declaration-form')
      expect(res.render).not.toHaveBeenCalled()
    })

    test('renders the submitted page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').mockResolvedValue({
        signedDate: moment(),
        checkEndDate: moment()
      })
      await sut.getHDFSubmitted(req, res)
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('getHDFSubmittedForm', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/attendance/submitted-form'
    }

    test('redirects to the submit page if there is no HDF', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').mockResolvedValue(false)
      await sut.getHDFSubmittedForm(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/attendance/declaration-form')
      expect(res.render).not.toHaveBeenCalled()
    })

    test('renders the submitted form page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(res, 'render').mockResolvedValue(null)
      jest.spyOn(headteacherDeclarationService, 'findLatestHdfForSchool').mockResolvedValue({
        signedDate: moment()
      })
      await sut.getHDFSubmittedForm(req, res)
      expect(res.render).toHaveBeenCalled()
    })
  })
})
