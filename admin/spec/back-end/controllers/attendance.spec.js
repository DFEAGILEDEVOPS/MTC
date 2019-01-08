'use strict'

/* global describe beforeEach afterEach it expect jasmine spyOn */

const sinon = require('sinon')
const httpMocks = require('node-mocks-http')

const controller = require('../../../controllers/attendance')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const hdfValidator = require('../../../lib/validator/hdf-validator')
const ValidationError = require('../../../lib/validation-error')

describe('attendance controller:', () => {
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

  describe('getDeclarationForm', () => {
    let goodReqParams = {
      method: 'GET',
      url: '/attendance/declaration-form',
      params: {}
    }

    it('renders the declaration form page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(headteacherDeclarationService, 'getEligibilityForSchool').and.returnValue(true)
      spyOn(res, 'render').and.returnValue(null)
      await controller.getDeclarationForm(req, res)
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('postDeclarationForm route', () => {
    let reqParams = {
      method: 'POST',
      url: '/attendance/submit-declaration-form',
      body: {},
      user: { id: 1, School: 1 }
    }

    it('redirects to the submit attendance page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(hdfValidator, 'validate').and.returnValue(new ValidationError())
      await controller.postDeclarationForm(req, res)
      expect(res.redirect).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    it('renders declaration form if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const validationError = new ValidationError()
      validationError.addError('firstName', true)
      spyOn(hdfValidator, 'validate').and.returnValue(validationError)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      await controller.postDeclarationForm(req, res)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })
})
