'use strict'

const httpMocks = require('node-mocks-http')

const businessAvailabilityService = require('../../../services/business-availability.service')
const attendanceCodeService = require('../../../services/attendance.service')
const attendanceService = require('../../../services/attendance.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const pupilService = require('../../../services/pupil.service')
const pupilsNotTakingCheckService = require('../../../services/pupils-not-taking-check.service')
const groupService = require('../../../services/group.service')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')

const pupilMock = require('../mocks/pupil-with-reason')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason-2')
const groupsMock = require('../mocks/groups')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')

describe('pupils-not-taking-the-check controller:', () => {
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
    let controller
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/pupils-not-taking-the-check/pupils-list'
    }

    beforeEach(() => {
      next = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    describe('#getPupilNotTakingCheck: When there are pupils for the active school', () => {
      beforeEach(() => {
        controller = require('../../../controllers/school').getPupilNotTakingCheck
      })

      test('should display \'pupils not taking the check\' initial page', async () => {
        jest.spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasons').mockResolvedValue(pupilsWithReasonsFormattedMock)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
        jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
        controller = require('../../../controllers/pupils-not-taking-the-check').getPupilNotTakingCheck

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(pupilsNotTakingCheckService.getPupilsWithReasons).toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe('Give a reason why a pupil is not taking the check')
        expect(next).not.toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
        expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      })

      test('should execute next if initial page fails to render', async () => {
        jest.spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasons').mockResolvedValue(Promise.reject(new Error()))
        controller = require('../../../controllers/pupils-not-taking-the-check').getPupilNotTakingCheck
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
        jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Give a reason why a pupil is not taking the check')
        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
        expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
        expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).not.toHaveBeenCalled()
      })
    })

    describe('#getSelectPupilNotTakingCheck : Select reason for pupils', () => {
      test('happy path', async () => {
        jest.spyOn(attendanceCodeService, 'getAttendanceCodes').mockResolvedValue([])
        jest.spyOn(pupilsNotTakingCheckService, 'getPupilsWithoutReasons').mockResolvedValue(pupilsWithReasonsMock)
        jest.spyOn(groupService, 'getGroupsWithPresentPupils').mockResolvedValue(groupsMock)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
        controller = require('../../../controllers/pupils-not-taking-the-check').getSelectPupilNotTakingCheck

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(attendanceCodeService.getAttendanceCodes).toHaveBeenCalled()
        expect(pupilsNotTakingCheckService.getPupilsWithoutReasons).toHaveBeenCalled()
        expect(groupService.getGroupsWithPresentPupils).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
      })

      test('unhappy path - attendanceCodeService.getAttendanceCodes fails', async () => {
        jest.spyOn(attendanceCodeService, 'getAttendanceCodes').mockResolvedValue(Promise.reject(new Error()))
        jest.spyOn(groupService, 'getGroups').mockResolvedValue(groupsMock)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
        controller = require('../../../controllers/pupils-not-taking-the-check').getSelectPupilNotTakingCheck

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(attendanceCodeService.getAttendanceCodes).toHaveBeenCalled()
        expect(groupService.getGroups).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })

      test('unhappy path - pupilsNotTakingCheckService.getPupilsWithoutReasons fails', async () => {
        jest.spyOn(attendanceCodeService, 'getAttendanceCodes').mockResolvedValue([])
        jest.spyOn(pupilsNotTakingCheckService, 'getPupilsWithoutReasons').mockResolvedValue(Promise.reject(new Error()))
        jest.spyOn(groupService, 'getGroupsWithPresentPupils').mockResolvedValue(groupsMock)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
        controller = require('../../../controllers/pupils-not-taking-the-check').getSelectPupilNotTakingCheck

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(attendanceCodeService.getAttendanceCodes).toHaveBeenCalled()
        expect(pupilsNotTakingCheckService.getPupilsWithoutReasons).toHaveBeenCalled()
        expect(groupService.getGroupsWithPresentPupils).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })

      test('unhappy path - groupService.getGroups fails', async () => {
        jest.spyOn(attendanceCodeService, 'getAttendanceCodes').mockResolvedValue([])
        jest.spyOn(pupilsNotTakingCheckService, 'getPupilsWithoutReasons').mockResolvedValue(pupilsWithReasonsMock)
        jest.spyOn(groupService, 'getGroupsWithPresentPupils').mockResolvedValue(Promise.reject(new Error()))
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
        controller = require('../../../controllers/pupils-not-taking-the-check').getSelectPupilNotTakingCheck

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(attendanceCodeService.getAttendanceCodes).toHaveBeenCalled()
        expect(pupilsNotTakingCheckService.getPupilsWithoutReasons).toHaveBeenCalled()
        expect(groupService.getGroupsWithPresentPupils).toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })

    describe('#savePupilNotTakingCheck: Save reason for pupil', () => {
      test('should save and redirect', async () => {
        jest.spyOn(attendanceService, 'updatePupilAttendanceBySlug').mockImplementation()
        controller = require('../../../controllers/pupils-not-taking-the-check').savePupilNotTakingCheck

        const res = getRes()
        const req = getReq(
          {
            method: 'POST',
            url: '/pupils-not-taking-the-check/save-pupils',
            body: {
              attendanceCode: '59df7e1c283960b43172ac6c',
              pupil: {
                _id: ['595cd5416e5ca13e48ed2518']
              }
            }
          }
        )

        await controller(req, res, next)
        expect(attendanceService.updatePupilAttendanceBySlug).toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
      })

      test('should redirect because req.body has missing data', async () => {
        jest.spyOn(attendanceService, 'updatePupilAttendanceBySlug').mockImplementation()
        controller = require('../../../controllers/pupils-not-taking-the-check').savePupilNotTakingCheck

        const res = getRes()
        const req = getReq(
          {
            method: 'POST',
            url: '/pupils-not-taking-the-check/save-pupils',
            body: {
              attendanceCode: undefined,
              pupil: {
                _id: ['595cd5416e5ca13e48ed2518']
              }
            }
          }
        )

        await controller(req, res, next)
        expect(attendanceService.updatePupilAttendanceBySlug).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
      })

      test('should return next because attendanceCodeService.updatePupilAttendanceBySlug fails', async () => {
        jest.spyOn(attendanceService, 'updatePupilAttendanceBySlug').mockResolvedValue(Promise.reject(new Error()))
        controller = require('../../../controllers/pupils-not-taking-the-check').savePupilNotTakingCheck

        const res = getRes()
        const req = getReq(
          {
            method: 'POST',
            url: '/pupils-not-taking-the-check/save-pupils',
            body: {
              attendanceCode: '59df7e1c283960b43172ac6c',
              pupil: {
                _id: ['595cd5416e5ca13e48ed2518']
              }
            }
          }
        )

        await controller(req, res, next)
        expect(attendanceService.updatePupilAttendanceBySlug).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })
    })

    describe('#removePupilNotTakingCheck: Remove:  reason for pupil', () => {
      test('should redirect to the select pupils page if pupilId is not supplied', async () => {
        jest.spyOn(attendanceService, 'unsetAttendanceCode').mockResolvedValue(Promise.resolve(true))
        jest.spyOn(pupilService, 'findOneBySlugAndSchool').mockResolvedValue(Promise.resolve(pupilMock))

        controller = require('../../../controllers/pupils-not-taking-the-check').removePupilNotTakingCheck

        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/pupils-not-taking-the-check/remove',
            params: {
              pupilId: undefined
            },
            user: {
              school: '42'
            }
          }
        )
        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
        expect(res._getRedirectUrl()).toBe('/pupils-not-taking-the-check/select-pupils')
        expect(next).not.toHaveBeenCalled()
      })

      test('should delete reason from pupils document and redirect', async () => {
        jest.spyOn(attendanceService, 'unsetAttendanceCode').mockResolvedValue(Promise.resolve(true))
        jest.spyOn(pupilService, 'findOneBySlugAndSchool').mockResolvedValue(Promise.resolve(pupilMock))
        controller = require('../../../controllers/pupils-not-taking-the-check').removePupilNotTakingCheck

        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/pupils-not-taking-the-check/remove',
            params: {
              pupilId: '59d02ab09b865f35a3f51940'
            },
            user: {
              schoolId: '42',
              id: '245',
              role: 'TEACHER'
            }
          }
        )
        await controller(req, res, next)
        expect(attendanceService.unsetAttendanceCode).toHaveBeenCalledWith(req.params.pupilId, req.user.schoolId, req.user.id, req.user.role)
        expect(req.flash).toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
      })

      test('should execute next if attendanceCodeService.unsetAttendanceCode fails', async () => {
        jest.spyOn(attendanceService, 'unsetAttendanceCode').mockResolvedValue(Promise.reject(new Error()))
        jest.spyOn(pupilService, 'findOneBySlugAndSchool').mockResolvedValue(Promise.resolve(pupilMock))
        controller = require('../../../controllers/pupils-not-taking-the-check').removePupilNotTakingCheck

        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/pupils-not-taking-the-check/remove',
            params: {
              pupilId: '59d02ab09b865f35a3f51940'
            },
            user: {
              schoolId: '42',
              id: '245',
              role: 'TEACHER'
            }
          }
        )
        await controller(req, res, next)
        expect(attendanceService.unsetAttendanceCode).toHaveBeenCalledWith(req.params.pupilId, req.user.schoolId, req.user.id, req.user.role)
        expect(pupilService.findOneBySlugAndSchool).not.toHaveBeenCalled()
        expect(req.flash).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })

      test('should execute next if pupilDataService.sqlFindOneBySlugAndSchool fails', async () => {
        jest.spyOn(attendanceService, 'unsetAttendanceCode').mockResolvedValue()
        jest.spyOn(pupilService, 'findOneBySlugAndSchool').mockResolvedValue(Promise.reject(new Error()))
        controller = require('../../../controllers/pupils-not-taking-the-check').removePupilNotTakingCheck

        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/pupils-not-taking-the-check/remove',
            params: {
              pupilId: '59d02ab09b865f35a3f51940'
            },
            user: {
              schoolId: '42',
              id: '245',
              role: 'TEACHER'
            }
          }
        )
        await controller(req, res, next)
        expect(attendanceService.unsetAttendanceCode).toHaveBeenCalledWith(req.params.pupilId, req.user.schoolId, req.user.id, req.user.role)
        expect(pupilService.findOneBySlugAndSchool).toHaveBeenCalled()
        expect(req.flash).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })
    })

    describe('#viewPupilsNotTakingTheCheck', () => {
      test('should make a call to get the pupils', async () => {
        jest.spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasons').mockResolvedValue(Promise.resolve(pupilsWithReasonsMock))
        jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
        controller = require('../../../controllers/pupils-not-taking-the-check').viewPupilsNotTakingTheCheck
        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/pupils-not-taking-the-check/remove',
            user: {
              school: '9991999'
            }
          }
        )
        await controller(req, res, next)
        expect(pupilsNotTakingCheckService.getPupilsWithReasons).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
      })
      test('should execute next if pupilsNotTakingCheckService.getPupilsWithReasons fails', async () => {
        jest.spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasons').mockResolvedValue(Promise.resolve(Promise.reject(new Error())))
        jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
        controller = require('../../../controllers/pupils-not-taking-the-check').viewPupilsNotTakingTheCheck
        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/pupils-not-taking-the-check/remove',
            user: {
              school: '9991999'
            }
          }
        )
        await controller(req, res, next)
        expect(pupilsNotTakingCheckService.getPupilsWithReasons).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
        expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })
    })
  })
})
