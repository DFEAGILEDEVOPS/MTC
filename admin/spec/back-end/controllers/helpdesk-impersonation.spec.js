'use strict'

/* global describe it expect jasmine beforeEach spyOn */

const controller = require('../../../controllers/helpdesk-impersonation')
const schoolImpersonationService = require('../../../services/school-impersonation.service')
const ValidationError = require('../../../lib/validation-error')

const httpMocks = require('node-mocks-http')

describe('helpdesk impersonation controller', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = params.user || { School: 9991001 }
    req.session = params.session || {}
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }
  beforeEach(() => {
    next = jasmine.createSpy('next')
  })
  describe('getSchoolImpersonation', () => {
    const reqParams = {
      method: 'GET',
      url: '/school-impersonation'
    }
    it('should render the school impersonation form', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(res, 'render')
      await controller.getSchoolImpersonation(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('postAddSchoolImpersonation', () => {
    const reqParams = {
      method: 'POST',
      url: '/school-impersonation',
      body: { dfeNumber: '1230000' }
    }
    it('should call schoolImpersonationService.setSchoolImpersonation method to validate dfeNumber given and create an impersonation', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(schoolImpersonationService, 'setSchoolImpersonation')
      await controller.postAddSchoolImpersonation(req, res, next)
      expect(schoolImpersonationService.setSchoolImpersonation).toHaveBeenCalled()
    })
    it('should render the helpdesk home if no validation error occurred', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(res, 'redirect')
      spyOn(schoolImpersonationService, 'setSchoolImpersonation').and.returnValue({ School: '1230000' })
      await controller.postAddSchoolImpersonation(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })
    it('should re-render the helpdesk impersonation form if a validation error occurred', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      const validationError = new ValidationError()
      validationError.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationService, 'setSchoolImpersonation').and.returnValue(validationError)
      spyOn(controller, 'getSchoolImpersonation')
      spyOn(res, 'render')
      await controller.postAddSchoolImpersonation(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(controller.getSchoolImpersonation).toHaveBeenCalled()
    })
  })
  describe('postRemoveSchoolImpersonation', () => {
    const reqParams = {
      method: 'POST',
      url: '/remove-school-impersonation'
    }
    it('should call schoolImpersonationService.removeImpersonation', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(schoolImpersonationService, 'removeImpersonation')
      await controller.postRemoveSchoolImpersonation(req, res, next)
      expect(schoolImpersonationService.removeImpersonation).toHaveBeenCalled()
    })
    it('should add a flash message and redirect to school impersonation form', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(schoolImpersonationService, 'removeImpersonation')
      spyOn(res, 'redirect')
      await controller.postRemoveSchoolImpersonation(req, res, next)
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
  })
})
