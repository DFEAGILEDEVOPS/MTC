'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const R = require('ramda')

const controller = require('../../../controllers/check-window')
const newCheckWindowAddService = require('../../../services/new-check-window-add.service')

describe('access arrangements controller:', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = {School: 9991001}
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
  describe('submitCheckWindow route', () => {
    let reqParams = {
      method: 'POST',
      url: '/check-window/submit-check-window',
      body: {}
    }

    it('submits the new check windows form page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(newCheckWindowAddService, 'process')
      await controller.submitCheckWindow(req, res, next)
      expect(newCheckWindowAddService.process).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('calls render when newCheckWindowAddService process throws a validation error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      const error = new Error('error')
      error.name = 'ValidationError'
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(error))
      spyOn(newCheckWindowAddService, 'process').and.returnValue(rejection)
      try {
        await controller.submitCheckWindow(req, res, next)
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
      expect(newCheckWindowAddService.process).toHaveBeenCalled()
    })
  })
})
