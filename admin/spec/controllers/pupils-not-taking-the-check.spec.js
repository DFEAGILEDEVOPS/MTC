'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const sinon = require('sinon')
const httpMocks = require('node-mocks-http')

const attendanceCodeDataService = require('../../services/data-access/attendance-code.data.service')
const attendanceService = require('../../services/attendance.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilsNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
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
      url: '/pupils-not-taking-the-check/pupils-list'
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('#getPupilNotTakingCheck: When there are pupils for the active school', () => {
      it('should display \'pupils not taking the check\' initial page', async (done) => {
        spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasons').and.returnValue(pupilsWithReasonsFormattedMock)
        controller = require('../../controllers/pupils-not-taking-the-check').getPupilNotTakingCheck

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Pupils not taking the check')
        expect(pupilsNotTakingCheckService.getPupilsWithReasons).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
        done()
      })

      it('should execute next if initial page fails to render', async (done) => {
        spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasons').and.returnValue(Promise.reject(new Error()))
        controller = require('../../controllers/pupils-not-taking-the-check').getPupilNotTakingCheck

        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Pupils not taking the check')
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('#getSelectPupilNotTakingCheck : Select reason for pupils', () => {
      beforeEach(() => {
        spyOn(sortingAttributesService, 'getAttributes').and.returnValue('asc', 'name')
        spyOn(attendanceCodeDataService, 'sqlFindAttendanceCodes').and.returnValue([])
        spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasonsForDfeNumber').and.returnValue(pupilsWithReasonsMock)
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
        expect(pupilsNotTakingCheckService.getPupilsWithReasonsForDfeNumber).toHaveBeenCalled()
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
            url: '/pupils-not-taking-the-check/save-pupils',
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

      it('should delete reason from pupils document and redirect', async () => {
        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/pupils-not-taking-the-check/remove',
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
        spyOn(pupilsNotTakingCheckService, 'getPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
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
      })
    })
  })
})
