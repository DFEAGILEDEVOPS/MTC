'use strict'
/* global describe, beforeEach, afterEach, expect, it, spyOn, jasmine */
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwtService = require('../../services/jwt.service')
const pinService = require('../../services/pin.service')

describe('check started controller', () => {
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

  describe('checkStarted route', () => {
    let sandbox
    let goodReqParams = {
      method: 'GET',
      url: '/pupil-pin/generate-pins-overview',
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
    it('returns bad request if checkCode is undefined', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/check-started').checkStarted
      await controller(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      done()
    })
    it('verifies a pupil as unauthorized if jwt verification fails', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body.checkCode = 'checkCode'
      const controller = require('../../controllers/check-started').checkStarted
      spyOn(jwtService, 'verify').and.returnValue((Promise.reject(new Error('error'))))
      await controller(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(401)
      expect(data.error).toBe('Unauthorised')
      done()
    })
    it('returns server error if pin expiration throws an exception', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body.checkCode = 'checkCode'
      const controller = require('../../controllers/check-started').checkStarted
      spyOn(jwtService, 'verify').and.returnValue((Promise.resolve('ok')))
      spyOn(pinService, 'expirePupilPin').and.returnValue((Promise.reject(new Error('error'))))
      await controller(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      done()
    })
    it('returns server error if pin expiration throws an exception', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      req.body.checkCode = 'checkCode'
      const controller = require('../../controllers/check-started').checkStarted
      spyOn(jwtService, 'verify').and.returnValue((Promise.resolve('ok')))
      spyOn(pinService, 'expirePupilPin').and.returnValue((Promise.resolve('ok')))
      await controller(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(201)
      expect(data).toBe('OK')
      done()
    })
  })
})
