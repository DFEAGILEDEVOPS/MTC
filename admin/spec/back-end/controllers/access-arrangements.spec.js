'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

const controller = require('../../../controllers/access-arrangements')

describe('access arrangements controller:', () => {
  let next

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

  beforeEach(() => {
    next = jasmine.createSpy('next')
  })

  describe('getOverview route', () => {
    let reqParams = {
      method: 'GET',
      url: '/access-arrangements/overview'
    }

    it('displays the access arrangements overview page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.getOverview(req, res, next)
      expect(res.locals.pageTitle).toBe('Access arrangements')
      expect(res.render).toHaveBeenCalled()
    })
  })
})
