'use strict'

/* global describe beforeEach it expect jasmine spyOn */
const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/check-form-v2')
const checkFormV2Service = require('../../../services/check-form-v2.service')

describe('check form v2 controller:', () => {
  let next
  beforeEach(() => {
    next = jasmine.createSpy('next')
  })

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

  describe('uploadAndViewFormsPage route', () => {
    let reqParams = {
      method: 'GET',
      url: '/check-forms-v2/upload-and-view-forms-v2'
    }
    it('renders upload and view forms v2 view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.uploadAndViewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload and view forms')
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('uploadCheckFormPage route', () => {
    let reqParams = {
      method: 'GET',
      url: '/check-forms-v2/upload-new-form-v2'
    }
    it('renders upload new form v2 view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.uploadCheckFormPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload new form')
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('submitCheckForm route', () => {
    let reqParams = {
      method: 'POST',
      url: '/check-forms-v2/submit-check-form-v2'
    }
    it('submits uploaded check form for validation and submission', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(checkFormV2Service, 'submit')
      await controller.submitCheckForm(req, res, next)
      expect(checkFormV2Service.submit).toHaveBeenCalled()
    })
  })
})
