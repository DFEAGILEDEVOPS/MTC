'use strict'

const httpMocks = require('node-mocks-http')
const sut = require('../../../controllers/test-developer2')
const checkFormPresenter = require('../../../helpers/check-form-presenter')
const checkFormV2Service = require('../../../services/test-developer.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')

describe('test developer 2 controller:', () => {
  let next
  beforeEach(() => {
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991001 }
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  describe('getViewFormsPage route', () => {
    const reqParams = {
      method: 'GET',
      url: '/test-developer/view-forms'
    }
    test('renders upload and view forms view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkFormV2Service, 'getSavedForms').mockImplementation()
      await sut.getViewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload and view forms')
      expect(checkFormV2Service.getSavedForms).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('getUploadNewFormsPage route', () => {
    const reqParams = {
      method: 'GET',
      url: '/test-developer/upload-new-forms'
    }
    test('renders upload new form view', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(checkFormV2Service, 'hasExistingFamiliarisationCheckForm').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getUploadNewFormsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Upload new form')
      expect(res.render).toHaveBeenCalled()
    })
    test('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      jest.spyOn(checkFormV2Service, 'hasExistingFamiliarisationCheckForm').mockRejectedValue(error)
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getUploadNewFormsPage(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('postUpload route', () => {
    const reqParams = {
      method: 'POST',
      url: '/test-developer/upload',
      files: {
        csvFiles: [{ filename: 'filename1' }, { filename: 'filename2' }]
      },
      body: {
        checkFormType: 'L'
      }
    }
    test('submits uploaded check form data processing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkFormV2Service, 'saveCheckForms').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getFlashMessageData').mockImplementation()
      await sut.postUpload(req, res, next)
      expect(checkFormV2Service.saveCheckForms).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    test('submits uploaded check form data processing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      const error = new Error('error')
      jest.spyOn(checkFormV2Service, 'saveCheckForms').mockRejectedValue(error)
      jest.spyOn(checkFormPresenter, 'getFlashMessageData').mockImplementation()
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
      url: '/test-developer/delete/urlSlug',
      params: {
        urlSlug: 'urlSlug'
      }
    }

    test('redirects to view forms page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(checkFormV2Service, 'getCheckFormName').mockImplementation()
      jest.spyOn(checkFormV2Service, 'deleteCheckForm').mockImplementation()
      jest.spyOn(res, 'redirect').mockImplementation()
      await sut.getDelete(req, res, next)
      expect(checkFormV2Service.getCheckFormName).toHaveBeenCalled()
      expect(checkFormV2Service.deleteCheckForm).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })

    test('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      jest.spyOn(checkFormV2Service, 'getCheckFormName').mockImplementation()
      jest.spyOn(checkFormV2Service, 'deleteCheckForm').mockRejectedValue(error)
      jest.spyOn(res, 'redirect').mockImplementation()
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
      url: '/test-developer/view/urlSlug',
      params: {
        urlSlug: 'urlSlug'
      }
    }
    test('redirects to view forms page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(checkFormV2Service, 'getCheckForm').mockReturnValue({ checkFormName: 'checkFormName' })
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getViewFormPage(req, res, next)
      expect(checkFormV2Service.getCheckForm).toHaveBeenCalled()
      expect(res.locals.pageTitle).toBe('checkFormName')
      expect(res.render).toHaveBeenCalled()
    })

    test('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      jest.spyOn(checkFormV2Service, 'getCheckForm').mockRejectedValue(error)
      jest.spyOn(res, 'render').mockImplementation()
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

    test('render assign forms to check windows page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(checkWindowV2Service, 'getPresentAndFutureCheckWindows').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationCheckWindowListData').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getAssignFormsPage(req, res, next)
      expect(checkWindowV2Service.getPresentAndFutureCheckWindows).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowListData).toHaveBeenCalled()
      expect(res.locals.pageTitle).toBe('Assign forms to check window')
      expect(res.render).toHaveBeenCalled()
    })

    test('returns next if service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      jest.spyOn(checkWindowV2Service, 'getPresentAndFutureCheckWindows').mockRejectedValue(error)
      jest.spyOn(checkFormPresenter, 'getPresentationCheckWindowListData').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
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

    // FIXME - node unhandled exception
    test('renders select check forms page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockImplementation()
      jest.spyOn(checkFormV2Service, 'getCheckFormsByType').mockImplementation()
      jest.spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationCheckWindowData').mockReturnValue({ name: 'checkWindowName', checkPeriod: 'MTC' })
      jest.spyOn(checkFormPresenter, 'getPresentationAvailableFormsData').mockReturnValue([])
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getSelectFormPage(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByType).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByCheckWindowIdAndType).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowData).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationAvailableFormsData).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
      expect(res.locals.pageTitle).toBe('checkWindowName - MTC')
    })

    test('returns next if getCheckWindow service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockRejectedValue(error)
      jest.spyOn(checkFormV2Service, 'getCheckFormsByType').mockImplementation()
      jest.spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationCheckWindowData').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationAvailableFormsData').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getSelectFormPage(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByType).not.toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByCheckWindowIdAndType).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowData).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationAvailableFormsData).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })

    test('returns next if getCheckFormsByType service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockImplementation()
      jest.spyOn(checkFormV2Service, 'getCheckFormsByType').mockRejectedValue(error)
      jest.spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationCheckWindowData').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationAvailableFormsData').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getSelectFormPage(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByType).toHaveBeenCalled()
      expect(checkFormV2Service.getCheckFormsByCheckWindowIdAndType).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckWindowData).not.toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationAvailableFormsData).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })

    test('returns next if getCheckFormsByCheckWindowIdAndType service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const error = new Error('error')
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockImplementation()
      jest.spyOn(checkFormV2Service, 'getCheckFormsByType').mockImplementation()
      jest.spyOn(checkFormV2Service, 'getCheckFormsByCheckWindowIdAndType').mockRejectedValue(error)
      jest.spyOn(checkFormPresenter, 'getPresentationCheckWindowData').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationAvailableFormsData').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
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

    test('submits uploaded check form data processing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue({ id: 1, name: 'name' })
      jest.spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm').mockResolvedValue(true)
      jest.spyOn(checkFormV2Service, 'updateCheckWindowForms').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getAssignFormsFlashMessage').mockImplementation()
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })

    test('returns next if getCheckWindow service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      const error = new Error('error')
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockRejectedValue(error)
      jest.spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm').mockImplementation()
      jest.spyOn(checkFormV2Service, 'updateCheckWindowForms').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getAssignFormsFlashMessage').mockImplementation()
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).not.toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })

    test('returns next if updateCheckWindowForms service method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      const error = new Error('error')
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue({ id: 1, name: 'name' })
      jest.spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm').mockResolvedValue(true)
      jest.spyOn(checkFormV2Service, 'updateCheckWindowForms').mockRejectedValue(error)
      jest.spyOn(checkFormPresenter, 'getAssignFormsFlashMessage').mockImplementation()
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })

    test('redirects to select forms page if empty familiarisation check form payload is submitted and one is not already assigned', async () => {
      const res = getRes()
      const req = getReq(badReqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue({ id: 1, name: 'name' })
      jest.spyOn(checkFormV2Service, 'hasAssignedFamiliarisationForm').mockReturnValue(false)
      jest.spyOn(checkFormV2Service, 'updateCheckWindowForms').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getAssignFormsFlashMessage').mockImplementation()
      await sut.postAssignForms(req, res, next)
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkFormV2Service.hasAssignedFamiliarisationForm).toHaveBeenCalled()
      expect(checkFormV2Service.updateCheckWindowForms).not.toHaveBeenCalled()
      expect(checkFormPresenter.getAssignFormsFlashMessage).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
  })
})
