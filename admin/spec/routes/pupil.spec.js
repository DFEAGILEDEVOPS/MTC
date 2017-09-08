'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const School = require('../../models/school')

describe('pupil controller:', () => {
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

  describe('getAddPupil() route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add',
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
        sandbox.mock(School).expects('findOne').chain('exec').resolves(new School({name: 'Test School'}))
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).getAddPupil
      })

      it('displays an add pupil page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).not.toHaveBeenCalled()
        done()
      })

      it('catches errors in the render() call', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').andThrow('test')
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(null)
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).getAddPupil
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
