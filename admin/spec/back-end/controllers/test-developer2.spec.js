'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const sut = require('../../../controllers/test-developer2')
const checkFormPresenter = require('../../../helpers/check-form-presenter')
const checkFormV2Service = require('../../../services/test-developer.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')

describe('test developer 2 controller:', () => {
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
    const reqParams = {
      method: 'GET',
      url: '/check-forms/view-forms'
    }
    it('renders upload and view forms view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkFormV2Service, 'getSavedForms')
      await sut.getViewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload and view forms')
      expect(checkFormV2Service.getSavedForms).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('getUploadNewFormsPage route', () => {
    const reqParams = {
      method: 'GET',
      url: '/check-forms/upload-new-forms'
    }
    it('renders upload new form view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(checkFormV2Service, 'hasExistingFamiliarisationCheckForm')
      spyOn(res, 'render')
      await sut.getUploadNewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload new form')
      expect(res.render).toHaveBeenCalled()
    })
    it('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkFormV2Service, 'hasExistingFamiliarisationCheckForm').and.returnValue(Promise.reject(error))
      spyOn(res, 'render')
      await sut.getUploadNewFormsPage(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('postUpload route', () => {
    const reqParams = {
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
      spyOn(checkFormPresenter, 'getFlashMessageData')
      await sut.postUpload(req, res, next)
      expect(checkFormV2Service.saveCheckForms).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('submits uploaded check form data processing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      const error = new Error('error')
      spyOn(checkFormV2Service, 'saveCheckForms').and.returnValue(Promise.reject(error))
      spyOn(checkFormPresenter, 'getFlashMessageData')
      await sut.postUpload(req, res, next)
      expect(checkFormV2Service.saveCheckForms).toHaveBeenCalled()
      expect(checkFormPresenter.getFlashMessageData).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('getDelete route', () => {
    const reqParams = {
      method: 'GET',
      url: '/check-forms/delete/urlSlug',
      params: {
        urlSlug: 'urlSlug'
      }
    }
    it('redirects to view forms page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(checkFormV2Service, 'getCheckFormName')
      spyOn(checkFormV2Service, 'deleteCheckForm')
      spyOn(res, 'redirect')
      await sut.getDelete(req, res, next)
      expect(checkFormV2Service.getCheckFormName).toHaveBeenCalled()
      expect(checkFormV2Service.deleteCheckForm).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkFormV2Service, 'getCheckFormName')
      spyOn(checkFormV2Service, 'deleteCheckForm').and.returnValue(Promise.reject(error))
      spyOn(res, 'redirect')
      await sut.getDelete(req, res, next)
      expect(checkFormV2Service.getCheckFormName).toHaveBeenCalled()
      expect(checkFormV2Service.deleteCheckForm).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('getViewFormPage route', () => {
    const reqParams = {
      method: 'GET',
      url: '/check-form/view/urlSlug',
      params: {
        urlSlug: 'urlSlug'
      }
    }
    it('redirects to view forms page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(checkFormV2Service, 'getCheckForm').and.returnValue({ checkFormName: 'checkFormName' })
      spyOn(res, 'render')
      await sut.getViewFormPage(req, res, next)
      expect(checkFormV2Service.getCheckForm).toHaveBeenCalled()
      expect(res.locals.pageTitle).toBe('checkFormName')
      expect(res.render).toHaveBeenCalled()
    })
    it('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkFormV2Service, 'getCheckForm').and.returnValue(Promise.reject(error))
      spyOn(res, 'render')
      await sut.getViewFormPage(req, res, next)
      expect(checkFormV2Service.getCheckForm).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('getAssignFormsPage route', () => {
    const reqParams = {
      method: 'GET',
      url: '/assign-forms-to-check-windows'
    }
    it('render assign forms to check windows page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(checkWindowV2Service, 'getPresentAndFutureCheckWindows')
      spyOn(checkFormPresenter, 'getPresentationCheckWindowListData')
      spyOn(res, 'render')
      await sut.getAssignFormsPage(req, res, next)
      expect(checkWindowV2Service.getPresentAndFutureCheckWindows).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowListData).toHaveBeenCalled()
      expect(res.locals.pageTitle).toBe('Assign forms to check window')
      expect(res.render).toHaveBeenCalled()
    })
    it('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkWindowV2Service, 'getPresentAndFutureCheckWindows').and.returnValue(Promise.reject(error))
      spyOn(checkFormPresenter, 'getPresentationCheckWindowListData')
      spyOn(res, 'render')
      await sut.getAssignFormsPage(req, res, next)
      expect(checkWindowV2Service.getPresentAndFutureCheckWindows).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowListData).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('getSelectFormPage route', () => {
    const reqParams = {
      method: 'GET',
      url: '/select-form/live/checkWindowUrlSlug',
      params: {
        checkWindowUrlSlug: 'checkWindowUrlSlug',
        checkFormType: 'live'
      }
    }
    it('renders select check forms page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(checkWindowV2Service, 'getCheckWindow')
      spyOn(checkFormV2Service, 'getCheckFormsByType')
      spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType')
      spyOn(checkFormPresenter, 'getPresentationCheckWindowData').and.returnValue({ name: 'checkWindowName', checkPeriod: 'MTC' })
      spyOn(checkFormPresenter, 'getPresentationAvailableFormsData')
      spyOn(res, 'render')
      await sut.getSelectFormPage(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByType).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByCheckWindowIdAndType).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowData).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationAvailableFormsData).toHaveBeenCalled()
      expect(res.locals.pageTitle).toBe('checkWindowName - MTC')
      expect(res.render).toHaveBeenCalled()
    })
    it('returns next if getCheckWindow service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkWindowV2Service, 'getCheckWindow').and.returnValue(Promise.reject(error))
      spyOn(checkFormV2Service, 'getCheckFormsByType')
      spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType')
      spyOn(checkFormPresenter, 'getPresentationCheckWindowData')
      spyOn(checkFormPresenter, 'getPresentationAvailableFormsData')
      spyOn(res, 'render')
      await sut.getSelectFormPage(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByType).not.toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByCheckWindowIdAndType).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowData).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationAvailableFormsData).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
    it('returns next if getCheckFormsByType service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkWindowV2Service, 'getCheckWindow')
      spyOn(checkFormV2Service, 'getCheckFormsByType').and.returnValue(Promise.reject(error))
      spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType')
      spyOn(checkFormPresenter, 'getPresentationCheckWindowData')
      spyOn(checkFormPresenter, 'getPresentationAvailableFormsData')
      spyOn(res, 'render')
      await sut.getSelectFormPage(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByType).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByCheckWindowIdAndType).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowData).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationAvailableFormsData).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
    it('returns next if getCheckFormsByCheckWindowIdAndType service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      spyOn(checkWindowV2Service, 'getCheckWindow')
      spyOn(checkFormV2Service, 'getCheckFormsByType')
      spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType').and.returnValue(Promise.reject(error))
      spyOn(checkFormPresenter, 'getPresentationCheckWindowData')
      spyOn(checkFormPresenter, 'getPresentationAvailableFormsData')
      spyOn(res, 'render')
      await sut.getSelectFormPage(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByType).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByCheckWindowIdAndType).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowData).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationAvailableFormsData).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
  describe('postAssignForms route', () => {
    const reqParams = {
      method: 'POST',
      url: '/assign-forms/live/checkWindowUrlSlug',
      files: {
        csvFiles: [{ filename: 'filename1' }, { filename: 'filename2' }]
      },
      params: {
        checkWindowUrlSlug: 'checkWindowUrlSlug',
        checkFormType: 'live'
      },
      body: {
        checkForms: ['urlslug1', 'urlSlug2']
      }
    }
    const badReqParams = {
      method: 'POST',
      url: '/assign-forms/live/checkWindowUrlSlug',
      files: {
        csvFiles: [{ filename: 'filename1' }, { filename: 'filename2' }]
      },
      params: {
        checkWindowUrlSlug: 'checkWindowUrlSlug',
        checkFormType: 'familiarisation'
      },
      body: {
        checkForms: undefined
      }
    }
    it('submits uploaded check form data processing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(checkWindowV2Service, 'getCheckWindow').and.returnValue({ id: 1, name: 'name' })
      spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm').and.returnValue(true)
      spyOn(checkFormV2Service, 'updateCheckWindowForms')
      spyOn(checkFormPresenter, 'getAssignFormsFlashMessage')
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('returns next if getCheckWindow service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      const error = new Error('error')
      spyOn(checkWindowV2Service, 'getCheckWindow').and.returnValue(Promise.reject(error))
      spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm')
      spyOn(checkFormV2Service, 'updateCheckWindowForms')
      spyOn(checkFormPresenter, 'getAssignFormsFlashMessage')
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).not.toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
    it('returns next if updateCheckWindowForms service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      const error = new Error('error')
      spyOn(checkWindowV2Service, 'getCheckWindow').and.returnValue({ id: 1, name: 'name' })
      spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm').and.returnValue(true)
      spyOn(checkFormV2Service, 'updateCheckWindowForms').and.returnValue(Promise.reject(error))
      spyOn(checkFormPresenter, 'getAssignFormsFlashMessage')
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
    it('redirects to select forms page if empty familiarisation check form payload is submitted and one is not already assigned', async () => {
      const res = getRes()
      const req = getReq(badReqParams)
      spyOn(res, 'redirect')
      spyOn(checkWindowV2Service, 'getCheckWindow').and.returnValue({ id: 1, name: 'name' })
      spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm').and.returnValue(false)
      spyOn(checkFormV2Service, 'updateCheckWindowForms')
      spyOn(checkFormPresenter, 'getAssignFormsFlashMessage')
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).not.toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
  })
})
