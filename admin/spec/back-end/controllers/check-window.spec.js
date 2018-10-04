'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/check-window')

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

  describe('getManageCheckWindows route', () => {
    let reqParams = {
      method: 'GET',
      url: '/check-window/manage-check-window'
    }

    it('displays the check windows hub page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.getManageCheckWindows(req, res, next)
      expect(res.locals.pageTitle).toBe('Manage check windows')
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('createCheckWindow route', () => {
    let reqParams = {
      method: 'GET',
      url: '/check-window/create-check-window'
    }

    it('displays the new check windows form page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.createCheckWindow(req, res, next)
      expect(res.locals.pageTitle).toBe('Create check window')
      expect(res.render).toHaveBeenCalled()
    })
  })
})
