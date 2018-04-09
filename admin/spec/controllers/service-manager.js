/* global jasmine describe expect it beforeEach afterEach spyOn */
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const controller = require('../../controllers/service-manager')
const settingService = require('../../services/setting.service')
const checkWindowService = require('../../services/check-window.service')
const settingsValidator = require('../../lib/validator/settings-validator')
const checkWindowValidator = require('../../lib/validator/check-window-validator')
const ValidationError = require('../../lib/validation-error')

describe('service manager controller:', () => {
  let sandbox
  let next
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    next = jasmine.createSpy('next')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getServiceManagerHome', () => {
    let goodReqParams = {
      method: 'GET',
      url: '/service-manager/home'
    }

    it('renders the service manager home page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.returnValue(null)
      await controller.getServiceManagerHome(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('getUpdateTiming', () => {
    let goodReqParams = {
      method: 'GET',
      url: '/service-manager/check-settings',
      params: {}
    }

    it('renders the custom timings page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(settingService, 'get').and.returnValue(null)
      spyOn(res, 'render').and.returnValue(null)
      await controller.getUpdateTiming(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
    it('throws an error if settings call is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(settingService, 'get').and.returnValue(Promise.reject(new Error('error')))
      spyOn(res, 'render')
      await controller.getUpdateTiming(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
    })
    describe('setUpdateTiming', () => {
      let goodReqParams = {
        method: 'POST',
        url: '/service-manager/check-settings',
        body: {
          loadingTimeLimit: 5,
          questionTimeLimit: 5
        },
        user: {
          id: 1
        }
      }

      it('calls redirect after successful update', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(settingsValidator, 'validate').and.returnValue(new ValidationError())
        spyOn(settingService, 'update')
        spyOn(res, 'redirect')
        await controller.setUpdateTiming(req, res, next)
        expect(res.redirect).toHaveBeenCalled()
        expect(settingService.update).toHaveBeenCalled()
      })
      it('renders check settings if validator error occurs', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        const validationError = new ValidationError()
        validationError.addError('adminDateInvalid', true)
        spyOn(settingsValidator, 'validate').and.returnValue(validationError)
        spyOn(res, 'redirect')
        spyOn(res, 'render')
        await controller.setUpdateTiming(req, res, next)
        expect(res.redirect).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalled()
      })
    })
    describe('getCheckWindows', () => {
      let goodReqParams = {
        method: 'GET',
        url: '/service-manager/check-windows',
        params: {
        }
      }

      it('calls render after fetching all check windows', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowService, 'getAllCheckWindows')
        spyOn(res, 'render')
        await controller.getCheckWindows(req, res, next)
        expect(res.render).toHaveBeenCalled()
      })
      it('throws an error when fetching all check windows call is rejected', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowService, 'getAllCheckWindows').and.returnValue(Promise.reject(new Error('error')))
        spyOn(res, 'render')
        await controller.getCheckWindows(req, res, next)
        expect(res.render).not.toHaveBeenCalled()
      })
    })
    describe('getCheckWindowForm', () => {
      let goodReqParams = {
        method: 'GET',
        url: '/service-manager/check-windows/add',
        params: {
        }
      }

      it('calls render', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render')
        await controller.getCheckWindowForm(req, res)
        expect(res.render).toHaveBeenCalled()
      })
    })
    describe('getEditableCheckWindowForm', () => {
      let goodReqParams = {
        method: 'GET',
        url: '/service-manager/check-windows/edit/1',
        params: {
          id: 1
        }
      }

      it('calls render after fetching editable check window form', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowService, 'getEditableCheckWindow')
          .and.returnValue({id: 1, adminIsDisabled: true, checkStartIsDisabled: true})
        spyOn(res, 'render')
        await controller.getEditableCheckWindowForm(req, res, next)
        expect(res.render).toHaveBeenCalled()
      })
      it('throws an error when fetching editable window form call is rejected', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowService, 'getEditableCheckWindow').and.returnValue(Promise.reject(new Error('error')))
        spyOn(res, 'render')
        await controller.getEditableCheckWindowForm(req, res, next)
        expect(res.render).not.toHaveBeenCalled()
      })
    })
    describe('saveCheckWindow', () => {
      let goodReqParams = {
        method: 'POST',
        url: '/service-manager/check-windows/save',
        body: {
          checkWindowId: 1,
          adminIsDisabled: 'true',
          checkStartIsDisabled: 'true'
        }
      }

      it('calls redirect after successful saving', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowValidator, 'validate').and.returnValue(new ValidationError())
        spyOn(checkWindowService, 'save')
        spyOn(res, 'redirect')
        await controller.saveCheckWindow(req, res, next)
        expect(res.redirect).toHaveBeenCalled()
      })
      it('calls render when a validation error occurs', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        const validationError = new ValidationError()
        validationError.addError('adminDateInvalid', true)
        spyOn(checkWindowValidator, 'validate').and.returnValue(validationError)
        spyOn(res, 'render')
        spyOn(res, 'redirect')
        await controller.saveCheckWindow(req, res, next)
        expect(res.render).toHaveBeenCalled()
        expect(res.redirect).not.toHaveBeenCalled()
      })
      it('throws an error when saving is rejected', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowValidator, 'validate').and.returnValue(new ValidationError())
        spyOn(checkWindowService, 'save').and.returnValue(Promise.reject(new Error('error')))
        spyOn(res, 'redirect')
        await controller.saveCheckWindow(req, res, next)
        expect(res.redirect).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
      describe('removeCheckWindow', () => {
        it('calls redirect after successful saving', async () => {
          let goodReqParams = {
            method: 'GET',
            url: '/service-manager/check-windows/remove/1',
            params: {
              checkWindowId: 1
            }
          }
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(checkWindowService, 'markDeleted').and.returnValue({ type: 'info', message: 'Check window deleted.' })
          spyOn(res, 'redirect')
          await controller.removeCheckWindow(req, res, next)
          expect(checkWindowService.markDeleted).toHaveBeenCalled()
          expect(res.redirect).toHaveBeenCalled()
        })
        it('calls redirect if check window id is not provided', async () => {
          let goodReqParams = {
            method: 'GET',
            url: '/service-manager/check-windows/remove/1',
            params: {}
          }
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(checkWindowService, 'markDeleted')
          spyOn(res, 'redirect')
          await controller.removeCheckWindow(req, res, next)
          expect(checkWindowService.markDeleted).not.toHaveBeenCalled()
          expect(res.redirect).toHaveBeenCalled()
        })
        it('throws an error if mark deletion is rejected', async () => {
          let goodReqParams = {
            method: 'GET',
            url: '/service-manager/check-windows/remove/1',
            params: {
              checkWindowId: 1
            }
          }
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(checkWindowService, 'markDeleted').and.returnValue(Promise.reject(new Error('error')))
          spyOn(res, 'redirect')
          await controller.removeCheckWindow(req, res, next)
          expect(checkWindowService.markDeleted).toHaveBeenCalled()
          expect(res.redirect).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
        })
      })
    })
  })
})
