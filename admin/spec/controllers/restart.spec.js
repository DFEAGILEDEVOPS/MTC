'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */
const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
require('sinon-mongoose')

describe('restart controller:', () => {
  function getRes() {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq(params) {
    const req = httpMocks.createRequest(params)
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('getRestartOverview route', () => {
    let sandbox
    let goodReqParams = {
      method: 'GET',
      url: '/restart/overview',
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

    it('displays the restart overview page when redirected from home page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/restart').getRestartOverview
      spyOn(res, 'render').and.returnValue(null)
      await controller(req, res)
      expect(res.locals.pageTitle).toBe('Restarts')
      expect(res.render).toHaveBeenCalled()
      done()
    })
  })

  describe('getSelectRestartList route', () => {
    let sandbox
    let goodReqParams = {
      method: 'GET',
      url: '/restart/select-restart-list',
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

    it('displays the restart overview page when redirected from home page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/restart').getSelectRestartList
      spyOn(res, 'render').and.returnValue(null)
      await controller(req, res)
      expect(res.locals.pageTitle).toBe('Select pupils for restart')
      expect(res.render).toHaveBeenCalled()
      done()
    })
  })
})
