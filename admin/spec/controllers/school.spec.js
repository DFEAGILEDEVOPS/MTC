'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise

const sinon = require('sinon')
require('sinon-mongoose')

const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')

const pupilService = require('../../services/pupil.service')
const pupilsNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
const pupilsNotTakingCheckDataService = require('../../services/data-access/pupils-not-taking-check.data.service')

const attendanceCodesMock = require('../mocks/attendance-codes')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')

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
    req.flash = null
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

    // describe('Select reason for pupils', () => {
    //   beforeEach(() => {
    //     spyOn(pupilsNotTakingCheckDataService, 'getAttendanceCodes').and.returnValue(Promise.resolve(attendanceCodesMock))
    //     spyOn(pupilService, 'fetchSortedPupilsData').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
    //     spyOn(pupilsNotTakingCheckService, 'formatPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsFormattedMock))
    //     spyOn(pupilsNotTakingCheckService, 'sortPupilsByReason').and.returnValue(Promise.resolve(pupilsWithReasonsFormattedMock))
    //     controller = proxyquire('../../controllers/school', {}).getSelectPupilNotTakingCheck
    //   })
    //
    //   it('should display reasons and pupils', async (done) => {
    //     const res = getRes()
    //     const req = getReq(goodReqParams)
    //     await controller(req, res, next)
    //     expect(res.statusCode).toBe(200)
    //     expect(res.locals.pageTitle).toBe('Select pupils not taking the check')
    //     expect(next).not.toHaveBeenCalled()
    //     done()
    //   })
    // })
  })
})
