'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const sinon = require('sinon')
require('sinon-mongoose')
const httpMocks = require('node-mocks-http')

const attendanceCodeDataService = require('../../services/data-access/attendance-code.data.service')
const attendanceCodesMock = require('../mocks/attendance-codes')
const attendanceService = require('../../services/attendance.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil-with-reason')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason-2')
const pupilsNotTakingCheckDataService = require('../../services/data-access/pupils-not-taking-check.data.service')

describe('school controller:', () => {
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
        spyOn(pupilsNotTakingCheckDataService, 'sqlFindPupilsWithReasons').and.returnValue(pupilsWithReasonsFormattedMock)
        controller = require('../../controllers/school').getPupilNotTakingCheck
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
        spyOn(attendanceCodeDataService, 'sqlFindAttendanceCodes').and.returnValue(attendanceCodesMock)
        spyOn(pupilDataService, 'sqlFindSortedPupilsWithAttendanceReasons').and.returnValue(pupilsWithReasonsMock)
        controller = require('../../controllers/school').getSelectPupilNotTakingCheck
      })

      it('makes a call to get the attendance codes', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(attendanceCodeDataService.sqlFindAttendanceCodes).toHaveBeenCalled()
      })

      it('makes a call to get the pupils with reasons', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(pupilDataService.sqlFindSortedPupilsWithAttendanceReasons).toHaveBeenCalled()
      })

      it('should display reasons and pupils', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Select pupil and reason')
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })

    describe('#savePupilNotTakingCheck: Save reason for pupil', () => {
      beforeEach(() => {
        spyOn(attendanceService, 'updatePupilAttendanceBySlug')
        controller = require('../../controllers/school').savePupilNotTakingCheck
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
        spyOn(attendanceService, 'unsetAttendanceCode').and.returnValue(true)
        spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue(pupilMock)
        controller = require('../../controllers/school').removePupilNotTakingCheck
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
        controller = require('../../controllers/school').viewPupilsNotTakingTheCheck
      })

      it('makes a call to get the pupils', async () => {
        spyOn(pupilsNotTakingCheckDataService, 'sqlFindPupilsWithReasons').and.returnValue(pupilsWithReasonsMock)
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
