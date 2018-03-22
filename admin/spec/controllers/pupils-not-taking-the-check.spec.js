'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const sinon = require('sinon')
const httpMocks = require('node-mocks-http')

const attendanceCodeDataService = require('../../services/data-access/attendance-code.data.service')
const attendanceService = require('../../services/attendance.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilsNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
const pupilsNotTakingCheckDataService = require('../../services/data-access/pupils-not-taking-check.data.service')
const sortingAttributesService = require('../../services/sorting-attributes.service')
const groupService = require('../../services/group.service')
const pupilMock = require('../mocks/pupil-with-reason')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason-2')
const groupsMock = require('../mocks/groups')

describe('pupils-not-taking-the-check controller:', () => {
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
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/school/pupils-not-taking-check'
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('#getPupilNotTakingCheck: When there are pupils for the active school', () => {
      beforeEach(() => {
        spyOn(pupilsNotTakingCheckService, 'pupilsWithReasons').and.returnValue(pupilsWithReasonsFormattedMock)
        controller = require('../../controllers/pupils-not-taking-the-check').getPupilNotTakingCheck
      })

      it('should display \'pupils not taking the check\' initial page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Pupils not taking the check')
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })

    describe('#getSelectPupilNotTakingCheck : Select reason for pupils', () => {
      beforeEach(() => {
        spyOn(sortingAttributesService, 'getAttributes').and.returnValue('asc', 'name')
        spyOn(attendanceCodeDataService, 'sqlFindAttendanceCodes').and.returnValue([])
        spyOn(pupilsNotTakingCheckService, 'pupils').and.returnValue(pupilsWithReasonsMock)
        spyOn(groupService, 'getGroups').and.returnValue(groupsMock)
        controller = require('../../controllers/pupils-not-taking-the-check').getSelectPupilNotTakingCheck
      })

      it('executes sortingAttributesService.getAttributes', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(sortingAttributesService.getAttributes).toHaveBeenCalled()
      })

      it('executes attendanceCodeDataService.sqlFindAttendanceCodes', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(attendanceCodeDataService.sqlFindAttendanceCodes).toHaveBeenCalled()
      })

      it('executes pupilDataService.sqlFindSortedPupilsWithAttendanceReasons', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(pupilsNotTakingCheckService.pupils).toHaveBeenCalled()
      })

      it('executes groupService.getGroups', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(groupService.getGroups).toHaveBeenCalled()
      })
    })

    describe('#savePupilNotTakingCheck: Save reason for pupil', () => {
      beforeEach(() => {
        spyOn(attendanceService, 'updatePupilAttendanceBySlug')
        controller = require('../../controllers/pupils-not-taking-the-check').savePupilNotTakingCheck
      })

      it('should save and redirect', async (done) => {
        const res = getRes()
        const req = getReq(
          {
            method: 'POST',
            url: '/school/pupils-not-taking-check/save-pupils',
            body: {
              attendanceCode: '59df7e1c283960b43172ac6c',
              pupil: {
                _id: [ '595cd5416e5ca13e48ed2518' ]
              }
            }
          }
        )
        await controller(req, res, next)
        expect(attendanceService.updatePupilAttendanceBySlug).toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
        done()
      })
    })

    describe('#removePupilNotTakingCheck: Remove:  reason for pupil', () => {
      beforeEach(() => {
        spyOn(attendanceService, 'unsetAttendanceCode').and.returnValue(Promise.resolve(true))
        spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue(Promise.resolve(pupilMock))
        controller = require('../../controllers/pupils-not-taking-the-check').removePupilNotTakingCheck
      })

      it('should redirect to the select pupils page if pupilId is not supplied', async () => {
        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/school/pupils-not-taking-check/remove',
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
        expect(res._getRedirectUrl()).toBe('/school/pupils-not-taking-check/select-pupils')
        expect(next).not.toHaveBeenCalled()
      })

      it('should delete reason from pupils document and redirect', async () => {
        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/school/pupils-not-taking-check/remove',
            params: {
              pupilId: '59d02ab09b865f35a3f51940'
            },
            user: {
              School: '42'
            }
          }
        )
        await controller(req, res, next)
        expect(attendanceService.unsetAttendanceCode).toHaveBeenCalledWith(req.params.pupilId, req.user.School)
        expect(req.flash).toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
      })
    })

    describe('#viewPupilsNotTakingTheCheck', () => {
      beforeEach(() => {
        controller = require('../../controllers/pupils-not-taking-the-check').viewPupilsNotTakingTheCheck
      })

      it('makes a call to get the pupils', async () => {
        spyOn(pupilsNotTakingCheckDataService, 'sqlFindPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/school/pupils-not-taking-check/remove',
            user: {
              school: '9991999'
            }
          }
        )
        await controller(req, res, next)
        expect(pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons).toHaveBeenCalled()
      })
    })
  })
})
