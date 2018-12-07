'use strict'

/* global describe beforeEach it expect jasmine spyOn */
const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/check-form-v2')

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

  describe('getViewFormsPage route', () => {
    let reqParams = {
      method: 'GET',
      url: '/check-forms/view-forms'
    }
    it('renders upload and view forms view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.getViewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload and view forms')
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('getUploadNewFormsPage route', () => {
    let reqParams = {
      method: 'GET',
      url: '/check-forms/upload-new-forms'
    }
    it('renders upload new form view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.getUploadNewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload new form')
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('postUpload route', () => {
    let reqParams = {
      method: 'POST',
      url: '/check-forms/upload',
      files: {
        csvFile: [{ filename: 'filename1' }, { filename: 'filename2' }]
      },
      body: {
        checkFormType: 'L'
      }
    }
    it('submits uploaded check form for validation and submission', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      await controller.postUpload(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })
  })
})
