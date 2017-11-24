'use strict'
/* global describe it expect jasmine spyOn */
const httpMocks = require('node-mocks-http')
const restartService = require('../../services/restart.service')

require('sinon-mongoose')

describe('restart controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('getRestartOverview route', () => {
    let goodReqParams = {
      method: 'GET',
      url: '/restart/overview',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    it('displays the restart overview page', async (done) => {
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
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/restart/select-restart-list',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      user: {
        School: 9991001
      }
    }

    it('displays the restart pupils list page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/restart').getSelectRestartList
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartService, 'getPupils').and.returnValue(null)
      await controller(req, res, next)
      expect(res.locals.pageTitle).toBe('Select pupils for restart')
      expect(res.render).toHaveBeenCalled()
      done()
    })
    it('calls next if an error occurs within restart service', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/restart').getSelectRestartList
      spyOn(res, 'render').and.returnValue(null)
      spyOn(restartService, 'getPupils').and.returnValue(Promise.reject(new Error('error')))
      await controller(req, res, next)
      expect(next).toHaveBeenCalled()
      done()
    })
  })
})
