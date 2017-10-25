'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise

const sinon = require('sinon')
require('sinon-mongoose')

const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')

const Pupil = require('../../models/pupil')
const School = require('../../models/school')

const pupilService = require('../../services/pupil.service')
const pupilsNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
const pupilsNotTakingCheckDataService = require('../../services/data-access/pupils-not-taking-check.data.service')
const generatePinsService = require('../../services/generate-pins.service')

const pupilMock = require('../mocks/pupil-with-reason')

const attendanceCodesMock = require('../mocks/attendance-codes')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason-2')
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
        spyOn(pupilService, 'fetchSortedPupilsData').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
        spyOn(pupilsNotTakingCheckService, 'formatPupilsWithReasons').and.returnValue(Promise.resolve(pupilsWithReasonsFormattedMock))
        spyOn(pupilsNotTakingCheckService, 'sortPupilsByReason').and.returnValue(Promise.resolve(pupilsWithReasonsFormattedMock))
        controller = proxyquire('../../controllers/school', {}).getSelectPupilNotTakingCheck
      })

      it('should display reasons and pupils', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Select pupils not taking the check')
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })

    describe('Save reason for pupil', () => {
      beforeEach(() => {
        spyOn(pupilService, 'fetchMultiplePupils').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
        spyOn(Pupil, 'create').and.returnValue(Promise.resolve(pupilMock))
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
                _id: ['595cd5416e5ca13e48ed2518']
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
        spyOn(pupilService, 'fetchOnePupil').and.returnValue(Promise.resolve(pupilsWithReasonsMock))
        spyOn(Pupil, 'create').and.returnValue(Promise.resolve(pupilMock))
        controller = proxyquire('../../controllers/school', {}).removePupilNotTakingCheck
      })
      it('should delete reason from pupils document and redirect', async (done) => {
        const res = getRes()
        const req = getReq(
          {
            method: 'GET',
            url: '/school/pupils-not-taking-check/remove',
            params: '59d02ab09b865f35a3f51940'
          }
        )
        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('getGeneratePinsOverview route', () => {
    let sandbox
    let goodReqParams = {
      method: 'GET',
      url: '/school/generate-pins-overview',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('displays the generate pins overview page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/school').getGeneratePinsOverview
      spyOn(res, 'render').and.returnValue(null)
      await controller(req, res)
      expect(res.locals.pageTitle).toBe('Generate pupil PINs')
      expect(res.render).toHaveBeenCalled()
      done()
    })
  })

  describe('getGeneratePinsList route', () => {
    let sandbox
    let next
    let controller
    let goodReqParams = {
      method: 'GET',
      url: '/school/generate-pins-list',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(new School({ name: 'Test School' }))
        controller = proxyquire('../../controllers/school.js', {
          '../models/school': School
        }).getGeneratePinsList
      })

      it('displays the generate pins list page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(generatePinsService, 'getPupils').and.returnValue(Promise.resolve({}))
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.locals.pageTitle).toBe('Select pupils')
        expect(res.render).toHaveBeenCalled()
        done()
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(null)
        controller = proxyquire('../../controllers/school.js', {
          '../models/school': School
        }).getGeneratePinsList
      })
      it('it throws an error', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })
  })
})
