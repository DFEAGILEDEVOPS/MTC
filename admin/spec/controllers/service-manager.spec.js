/* global jasmine describe expect it beforeEach spyOn */
const httpMocks = require('node-mocks-http')
const controller = require('../../controllers/service-manager')
const settingService = require('../../services/setting.service')
const checkWindowService = require('../../services/check-window.service')
const pupilCensusService = require('../../services/pupil-census.service')
const checkWindowAddService = require('../../services/check-window-add.service')
const checkWindowEditService = require('../../services/check-window-edit.service')
const settingsValidator = require('../../lib/validator/settings-validator')
const checkWindowValidator = require('../../lib/validator/check-window-validator')
const ValidationError = require('../../lib/validation-error')

describe('service manager controller:', () => {
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
    next = jasmine.createSpy('next')
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

  describe('getCheckWindowEditForm', () => {
    let goodReqEditParams = {
      method: 'GET',
      url: '/service-manager/check-windows/edit/1',
      params: {
        id: 1
      }
    }

    it('calls render after fetching editable check window form', async () => {
      const res = getRes()
      const req = getReq(goodReqEditParams)
      spyOn(checkWindowService, 'getCheckWindowEditForm')
        .and.returnValue({ id: 1 })
      spyOn(res, 'render')
      await controller.getCheckWindowEditForm(req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowService.getCheckWindowEditForm).toHaveBeenCalled()
    })
    it('throws an error when fetching check window edit form call is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqEditParams)
      spyOn(checkWindowService, 'getCheckWindowEditForm').and.returnValue(Promise.reject(new Error('error')))
      spyOn(res, 'render')
      await controller.getCheckWindowEditForm(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
    })
  })

  describe('submitCheckWindow', () => {
    const goodReqAddParams = {
      method: 'POST',
      url: '/service-manager/check-windows/submit',
      body: {}
    }
    const goodReqEditParams = {
      method: 'POST',
      url: '/service-manager/check-windows/submit',
      body: {
        urlSlug: '2B9DAD9C-A75D-4AAA-BAAA-400A2F2C466C'
      }
    }

    it('calls checkWindowAddService process method and redirects after successfully adding', async () => {
      const res = getRes()
      const req = getReq(goodReqAddParams)
      spyOn(res, 'redirect')
      spyOn(checkWindowAddService, 'process')
      await controller.submitCheckWindow(req, res, next)
      expect(checkWindowAddService.process).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('calls checkWindowEditService process method and redirects after successfully adding', async () => {
      const res = getRes()
      const req = getReq(goodReqEditParams)
      spyOn(res, 'redirect')
      spyOn(checkWindowEditService, 'process')
      await controller.submitCheckWindow(req, res, next)
      expect(checkWindowEditService.process).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
    })
    it('calls render when checkWindowEditService process throws a validation error', async () => {
      const res = getRes()
      const req = getReq(goodReqEditParams)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(checkWindowService, 'getSubmittedCheckWindowData')
      const error = new Error('error')
      error.name = 'ValidationError'
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(error))
      spyOn(checkWindowEditService, 'process').and.returnValue(rejection)
      try {
        await controller.submitCheckWindow(req, res, next)
      } catch (error) {
        expect(error.name).toBe('ValidationError')
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowService.getSubmittedCheckWindowData).toHaveBeenCalled()
    })
    it('calls render when checkWindowAddService process throws a non validation error', async () => {
      const res = getRes()
      const req = getReq(goodReqAddParams)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(checkWindowService, 'getSubmittedCheckWindowData')
      const error = new Error('error')
      error.name = 'OtherError'
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(error))
      spyOn(checkWindowEditService, 'process').and.returnValue(rejection)
      try {
        await controller.submitCheckWindow(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      expect(checkWindowService.getSubmittedCheckWindowData).not.toHaveBeenCalled()
    })
  })

  describe('getUploadPupilCensus', () => {
    let goodReqParams = {
      method: 'GET',
      url: '/service-manager/upload-pupil-census'
    }

    it('renders the upload pupil census page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render')
      spyOn(pupilCensusService, 'getUploadedFile')
      await controller.getUploadPupilCensus(req, res, next)
      expect(pupilCensusService.getUploadedFile).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    it('throws an error if fetching existing pupil census fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render')
      spyOn(pupilCensusService, 'getUploadedFile').and.returnValue(Promise.reject(new Error('error')))
      try {
        await controller.getUploadPupilCensus(req, res, next)
      } catch (error) {
        expect(error).toBe('error')
      }
      expect(next).toHaveBeenCalled()
      expect(pupilCensusService.getUploadedFile).toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })
  })
  describe('postUploadPupilCensus', () => {
    const goodReqParams = {
      method: 'POST',
      url: '/service-manager/upload-pupil-census/upload',
      files: {
        csvPupilCensusFile: { name: 'test' }
      }
    }

    const badReqParams = {
      method: 'POST',
      url: '/service-manager/upload-pupil-census/upload',
      files: {
        csvPupilCensusFile: {}
      }
    }

    it('redirects to pupil census page when successfully uploaded a csv file', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      spyOn(pupilCensusService, 'upload')
      await controller.postUploadPupilCensus(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })
    it('calls next when upload is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      spyOn(pupilCensusService, 'upload').and.returnValue(Promise.reject(new Error('error')))
      await controller.postUploadPupilCensus(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
    it('calls next when there is no file to upload', async () => {
      const res = getRes()
      const req = getReq(badReqParams)
      spyOn(res, 'redirect')
      await controller.postUploadPupilCensus(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
  describe('getRemovePupilCensus', () => {
    const goodReqParams = {
      method: 'POST',
      url: '/service-manager/upload-pupil-census/upload',
      params: {
        pupilCensusId: 1
      }
    }

    it('redirects to pupil census page when successfully removed the selected pupil', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      spyOn(pupilCensusService, 'remove')
      await controller.getRemovePupilCensus(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })
    it('calls next when upload is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      spyOn(pupilCensusService, 'remove').and.returnValue(Promise.reject(new Error('error')))
      await controller.getRemovePupilCensus(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
