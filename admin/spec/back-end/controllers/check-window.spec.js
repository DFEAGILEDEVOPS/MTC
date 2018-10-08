'use strict'

/* global describe beforeEach fail it expect jasmine spyOn */

const moment = require('moment')
const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/check-window')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const checkWindowErrorMessages = require('../../../lib/errors/check-window-v2')

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
      spyOn(checkWindowV2AddService, 'submit')
      await controller.submitCheckWindow(req, res, next)
      expect(checkWindowV2AddService.submit).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('calls next when checkWindowV2AddService submit throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      const error = new Error('error')
      error.name = 'error'
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(error))
      spyOn(checkWindowV2AddService, 'submit').and.returnValue(rejection)
      await controller.submitCheckWindow(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      expect(req.flash).not.toHaveBeenCalled()
      expect(checkWindowV2AddService.submit).toHaveBeenCalled()
    })
    it('calls render when checkWindowV2AddService process throws a validation error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      const renderSpy = spyOn(res, 'render')
      const validationError = new Error('error')
      validationError.name = 'ValidationError'
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(validationError))
      spyOn(checkWindowV2AddService, 'submit').and.returnValue(rejection)
      await controller.submitCheckWindow(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(renderSpy.calls.all()[0].args[1].error).toBe(validationError)
      expect(checkWindowV2AddService.submit).toHaveBeenCalled()
    })
  })
})
