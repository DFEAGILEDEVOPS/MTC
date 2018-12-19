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
      spyOn(checkFormV2Service, 'hasExistingFamiliarisationCheckForm')
      spyOn(res, 'render')
      await controller.getUploadNewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload new form')
      expect(res.render).toHaveBeenCalled()
    })
    it('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkFormV2Service, 'hasExistingFamiliarisationCheckForm').and.returnValue(Promise.reject(error))
      spyOn(res, 'render')
      await controller.getUploadNewFormsPage(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('postUpload route', () => {
    let reqParams = {
      method: 'POST',
      url: '/check-forms/upload',
      files: {
        csvFiles: [{ filename: 'filename1' }, { filename: 'filename2' }]
      },
      body: {
        checkFormType: 'L'
      }
    }
    it('submits uploaded check form data processing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(checkFormV2Service, 'saveCheckForms')
      await controller.postUpload(req, res, next)
      expect(checkFormV2Service.saveCheckForms).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('submits uploaded check form data processing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      const error = new Error('error')
      spyOn(checkFormV2Service, 'saveCheckForms').and.returnValue(Promise.reject(error))
      await controller.postUpload(req, res, next)
      expect(checkFormV2Service.saveCheckForms).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
