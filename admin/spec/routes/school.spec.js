'use strict'
/* global describe beforeEach afterEach it expect jasmine, spyOn */

const sinon = require('sinon')
require('sinon-mongoose')
const httpMocks = require('node-mocks-http')

describe('school controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
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
    let goodReqParams = {
      method: 'GET',
      url: '/school/generate-pins-list',
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

    it('displays the generate pins list page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/school').getGeneratePinsList
      spyOn(res, 'render').and.returnValue(null)
      await controller(req, res)
      expect(res.locals.pageTitle).toBe('Select pupils')
      expect(res.render).toHaveBeenCalled()
      done()
    })
  })
})
