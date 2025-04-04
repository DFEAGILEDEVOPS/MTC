'use strict'

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
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  beforeEach(() => {
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getSchoolImpersonation', () => {
    const reqParams = {
      method: 'GET',
      url: '/school-impersonation'
    }
    test('should render the school impersonation form', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      jest.spyOn(res, 'render').mockImplementation()
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
    test('should call schoolImpersonationService.setSchoolImpersonation method to validate dfeNumber given and create an impersonation', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      jest.spyOn(schoolImpersonationService, 'setSchoolImpersonation').mockImplementation()
      await controller.postAddSchoolImpersonation(req, res, next)
      expect(schoolImpersonationService.setSchoolImpersonation).toHaveBeenCalled()
    })
    test('should render the helpdesk home if no validation error occurred', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(schoolImpersonationService, 'setSchoolImpersonation').mockResolvedValue({ School: '1230000' })
      await controller.postAddSchoolImpersonation(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })
    test('should re-render the helpdesk impersonation form if a validation error occurred', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      const validationError = new ValidationError()
      validationError.addError('dfeNumber', 'error')
      jest.spyOn(schoolImpersonationService, 'setSchoolImpersonation').mockResolvedValue(validationError)
      jest.spyOn(controller, 'getSchoolImpersonation').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
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
    test('should call schoolImpersonationService.removeImpersonation', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      jest.spyOn(schoolImpersonationService, 'removeImpersonation').mockImplementation()
      await controller.postRemoveSchoolImpersonation(req, res, next)
      expect(schoolImpersonationService.removeImpersonation).toHaveBeenCalled()
    })
    test('should add a flash message and redirect to school impersonation form', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      jest.spyOn(schoolImpersonationService, 'removeImpersonation').mockImplementation()
      jest.spyOn(res, 'redirect').mockImplementation()
      await controller.postRemoveSchoolImpersonation(req, res, next)
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
  })
})
