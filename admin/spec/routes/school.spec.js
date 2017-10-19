'use strict'
/* global describe beforeEach afterEach it expect jasmine, spyOn */

const sinon = require('sinon')
require('sinon-mongoose')
const httpMocks = require('node-mocks-http')
const proxyquire = require('proxyquire').noCallThru()
const School = require('../../models/school')
const generatePinsService = require('../../services/generate-pins.service')

describe('school controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991999 }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    return req
  }

  describe('getGeneratePinsOverview() route', () => {
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

  describe('getGeneratePinsList() route', () => {
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
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })
})
