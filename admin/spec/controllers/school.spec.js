'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise

const sinon = require('sinon')
require('sinon-mongoose')

const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')

const pupilService = require('../../services/pupil.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilsNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
const pupilsNotTakingCheckDataService = require('../../services/data-access/pupils-not-taking-check.data.service')

const pupilMock = require('../mocks/pupil-with-reason')
const attendanceCodesMock = require('../mocks/attendance-codes')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason-2')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')
const mongooseResponseMock = require('../mocks/mongo-response-mock')

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

    describe('When there are pupils for the active school', () => {
      beforeEach(() => {
        spyOn(pupilsNotTakingCheckDataService, 'getAttendanceCodes').and.returnValue(Promise.resolve(attendanceCodesMock))
        spyOn(pupilsNotTakingCheckDataService, 'fetchPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
        spyOn(pupilsNotTakingCheckService, 'formatPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsFormattedMock))
        controller = proxyquire('../../controllers/school', {}).getPupilNotTakingCheck
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

    describe('Select reason for pupils', () => {
      beforeEach(() => {
        spyOn(pupilsNotTakingCheckDataService, 'getAttendanceCodes').and.returnValue(Promise.resolve(attendanceCodesMock))
        spyOn(pupilDataService, 'getSortedPupils').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
        spyOn(pupilsNotTakingCheckService, 'formatPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsFormattedMock))
        spyOn(pupilsNotTakingCheckService, 'sortPupilsByReason').and.returnValue(Promise.resolve(pupilsWithReasonsFormattedMock))
        controller = proxyquire('../../controllers/school', {}).getSelectPupilNotTakingCheck
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

    describe('Save reason for pupil', () => {
      beforeEach(() => {
        const pupil = Object.assign({}, pupilsWithReasonsMock)
        pupil.save = () => {
        }
        spyOn(pupilService, 'fetchMultiplePupils').and.returnValue(Promise.resolve(pupil))
        // spyOn(Pupil, 'create').and.returnValue(Promise.resolve(pupilMock))
        spyOn(pupilsNotTakingCheckDataService, 'getAttendanceCodes').and.returnValue(Promise.resolve(attendanceCodesMock))
        spyOn(pupilsNotTakingCheckDataService, 'fetchPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
        controller = proxyquire('../../controllers/school', {}).savePupilNotTakingCheck
      })

      it('should save and display reasons and pupils', async (done) => {
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
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Save pupils not taking the check')
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })

    describe('Remove reason for pupil', () => {
      beforeEach(() => {
        spyOn(pupilService, 'fetchOnePupil').and.returnValue(Promise.resolve(pupilMock))
        spyOn(pupilDataService, 'unsetAttendanceCode').and.returnValue(Promise.resolve(mongooseResponseMock))
        controller = proxyquire('../../controllers/school', {
          '../services/pupil.service': pupilService,
          '../services/data-access/pupil.data.service': pupilDataService
        }).removePupilNotTakingCheck
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
              school: '42'
            }
          }
        )
        await controller(req, res, next)
        expect(pupilService.fetchOnePupil).toHaveBeenCalled()
        expect(pupilDataService.unsetAttendanceCode).toHaveBeenCalledWith('59d02ab09b865f35a3f51940')
        expect(res.statusCode).toBe(302)
        expect(res._getRedirectUrl()).toBe('/school/pupils-not-taking-check/59d02ab09b865f35a3f51940')
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
