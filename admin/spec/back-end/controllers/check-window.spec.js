'use strict'

const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/check-window')
const checkWindowPresenter = require('../../../helpers/check-window-presenter')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const checkWindowV2UpdateService = require('../../../services/check-window-v2-update.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const ValidationError = require('../../../lib/validation-error')

describe('check window controller:', () => {
  let next

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

  beforeEach(() => {
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getManageCheckWindows route', () => {
    const reqParams = {
      method: 'GET',
      url: '/check-window/manage-check-window'
    }

    test('displays the check windows hub page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindows').mockImplementation()
      await controller.getManageCheckWindows(req, res, next)
      expect(res.locals.pageTitle).toBe('Manage check windows')
      expect(res.render).toHaveBeenCalled()
    })
    test('calls next if getCheckWindows method throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindows').mockRejectedValue(new Error('error'))
      await controller.getManageCheckWindows(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
  describe('createCheckWindow route', () => {
    const reqParams = {
      method: 'GET',
      url: '/check-window/create-check-window'
    }

    test('displays the new check windows form page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      await controller.createCheckWindow(req, res, next)
      expect(res.locals.pageTitle).toBe('Create check window')
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('submitCheckWindow route', () => {
    const reqParams = {
      method: 'POST',
      url: '/check-window/submit-check-window',
      body: {
        checkWindowName: 'New check window'
      }
    }

    const reqEditParams = {
      method: 'POST',
      url: '/check-window/submit-check-window',
      body: {
        checkWindowUrlSlug: 'checkWindowUrlSlug'
      }
    }

    test('submits the new check windows form page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2AddService, 'submit').mockImplementation()
      await controller.submitCheckWindow(req, res, next)
      expect(checkWindowV2AddService.submit).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('info', 'New check window has been created')
      expect(res.redirect).toHaveBeenCalled()
    })
    test('submits the edited check windows form page', async () => {
      const res = getRes()
      const req = getReq(reqEditParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2UpdateService, 'submit').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue({ name: 'Edited check window' })
      await controller.submitCheckWindow(req, res, next)
      expect(checkWindowV2UpdateService.submit).toHaveBeenCalled()
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('info', 'Edited check window has been edited')
      expect(res.redirect).toHaveBeenCalled()
    })
    test('calls next when checkWindowV2AddService submit throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      const error = new Error('error')
      error.name = 'error'
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(error))
      jest.spyOn(checkWindowV2AddService, 'submit').mockResolvedValue(rejection)
      await controller.submitCheckWindow(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      expect(req.flash).not.toHaveBeenCalled()
      expect(checkWindowV2AddService.submit).toHaveBeenCalled()
    })
    test('calls render when checkWindowV2AddService process throws a validation error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      let resRenderData
      function resRenderMock (url, data) {
        resRenderData = data
      }
      jest.spyOn(res, 'render').mockImplementation(resRenderMock)
      const validationError = new ValidationError()
      validationError.name = 'ValidationError'
      jest.spyOn(checkWindowV2AddService, 'submit').mockRejectedValue(validationError)
      await controller.submitCheckWindow(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(resRenderData.error).toBe(validationError)
      expect(checkWindowV2AddService.submit).toHaveBeenCalled()
    })
  })
  describe('removeCheckWindow route', () => {
    const reqParams = {
      method: 'GET',
      url: '/remove/:checkWindowUrlSlug',
      params: {
        checkWindowUrlSlug: 'checkWindowUrlSlug'
      }
    }

    test('calls markDeleted to perform check window deletion marking', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'markDeleted').mockResolvedValue({ type: 'type', message: 'message' })
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue({ name: 'Check window' })
      await controller.removeCheckWindow(req, res, next)
      expect(checkWindowV2Service.markDeleted).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('info', 'Check window has been successfully removed')
      expect(res.redirect).toHaveBeenCalled()
    })
    test('calls next if an error is thrown from markDeleted method', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'markDeleted').mockRejectedValue(new Error('error'))
      await controller.removeCheckWindow(req, res, next)
      expect(checkWindowV2Service.markDeleted).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })
    describe('getCheckWindowEditForm route', () => {
      const reqParams = {
        method: 'GET',
        url: '/edit/:checkWindowUrlSlug',
        params: {
          checkWindowUrlSlug: 'checkWindowUrlSlug'
        }
      }
      test('calls getCheckWindowEditData and renders check window form', async () => {
        const res = getRes()
        const req = getReq(reqParams)
        jest.spyOn(res, 'render').mockImplementation()
        jest.spyOn(checkWindowPresenter, 'getViewModelData').mockImplementation()
        jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockImplementation()
        await controller.getCheckWindowEditForm(req, res, next)
        expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
        expect(checkWindowPresenter.getViewModelData).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe('Edit check window')
        expect(res.render).toHaveBeenCalled()
      })
      test('calls next when getCheckWindowEditData throws an error', async () => {
        const res = getRes()
        const req = getReq(reqParams)
        jest.spyOn(res, 'render').mockImplementation()
        jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockRejectedValue(new Error('error'))
        jest.spyOn(checkWindowPresenter, 'getViewModelData').mockImplementation()
        await controller.getCheckWindowEditForm(req, res, next)
        expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
        expect(checkWindowPresenter.getViewModelData).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
        expect(res.render).not.toHaveBeenCalled()
      })
    })
  })
})
