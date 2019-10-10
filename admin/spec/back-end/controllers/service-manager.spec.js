/* global jasmine describe expect it beforeEach spyOn */
const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/service-manager')
const settingService = require('../../../services/setting.service')
const sceService = require('../../../services/sce.service')
const checkWindowService = require('../../../services/check-window.service')
const pupilCensusService = require('../../../services/pupil-census.service')
const checkWindowAddService = require('../../../services/check-window-add.service')
const checkWindowEditService = require('../../../services/check-window-edit.service')
const sceSchoolValidator = require('../../../lib/validator/sce-school-validator')
const scePresenter = require('../../../helpers/sce')
const uploadedFileService = require('../../../services/uploaded-file.service')
const administrationMessageProcessingService = require('../../../services/administration-message-processing.service')
const administrationMessageService = require('../../../services/administration-message.service')
const settingsValidator = require('../../../lib/validator/settings-validator')
const ValidationError = require('../../../lib/validation-error')

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
        questionTimeLimit: 5,
        checkTimeLimit: 30
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
      spyOn(uploadedFileService, 'getFilesize')
      await controller.getUploadPupilCensus(req, res, next)
      expect(pupilCensusService.getUploadedFile).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    it('throws an error if fetching existing pupil census fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render')
      spyOn(uploadedFileService, 'getFilesize')
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
      spyOn(pupilCensusService, 'process').and.returnValue(new ValidationError())
      spyOn(pupilCensusService, 'upload2')
      await controller.postUploadPupilCensus(req, res, next)
      expect(pupilCensusService.process).toHaveBeenCalled()
      expect(pupilCensusService.upload2).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })
    it('calls next when upload is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      spyOn(pupilCensusService, 'process').and.returnValue(new ValidationError())
      spyOn(pupilCensusService, 'upload2').and.returnValue(Promise.reject(new Error('error')))
      await controller.postUploadPupilCensus(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
    it('calls getUploadPupilCensus with validation error when there is a file error', async () => {
      const res = getRes()
      const req = getReq(badReqParams)
      spyOn(res, 'redirect')
      const validationError = new ValidationError()
      validationError.addError('upload-element', 'error')
      spyOn(pupilCensusService, 'process').and.returnValue(validationError)
      spyOn(pupilCensusService, 'upload2')
      spyOn(controller, 'getUploadPupilCensus')
      await controller.postUploadPupilCensus(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(controller.getUploadPupilCensus).toHaveBeenCalled()
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

  describe('getSceSettings', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-manager/sce-settings'
      }
    })

    it('should render after fetching schools', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceService, 'getSceSchools')
        .and.returnValue([{ name: 'school', urn: '42' }])
      spyOn(scePresenter, 'getCountriesTzData').and.returnValue([])
      spyOn(res, 'render')
      await controller.getSceSettings(req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(sceService.getSceSchools).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should throw an error when fetching schools call is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceService, 'getSceSchools').and.returnValue(Promise.reject(new Error('error')))
      spyOn(scePresenter, 'getCountriesTzData').and.returnValue([])
      spyOn(res, 'render')
      await controller.getSceSettings(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('cancelSceSettings', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/service-manager/sce-settings/cancel',
      session: {
        sceSchoolsData: 'data'
      }
    }

    it('redirect to the index page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      await controller.cancelSceSettings(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/service-manager')
    })
  })

  describe('postSceSettings', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'POST',
        url: '/service-manager/sce-settings',
        body: { urn: [], timezone: [] }
      }
      spyOn(sceService, 'getSceSchools')
        .and.returnValue([{ id: 1, name: 'Test School', urn: 123456 }])
    })

    it('redirects to the sce settings page when successfully applied changes', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      spyOn(sceService, 'applySceSettings')
      await controller.postSceSettings(req, res, next)
      expect(sceService.applySceSettings).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })

    it('calls next when applying sce settings failed', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'redirect')
      spyOn(sceService, 'applySceSettings').and.returnValue(Promise.reject(new Error('error')))
      await controller.postSceSettings(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('getSceAddSchool', () => {
    let goodReqParams = {
      method: 'GET',
      url: '/service-manager/sce-add-school',
      params: {
        id: 1
      }
    }

    it('calls render after fetching schools', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceService, 'getSchools')
        .and.returnValue([{ name: 'school', urn: '42' }])
      spyOn(res, 'render')
      await controller.getSceAddSchool(req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(sceService.getSchools).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('throws an error when fetching schools call is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceService, 'getSchools').and.returnValue(Promise.reject(new Error('error')))
      spyOn(res, 'render')
      await controller.getSceAddSchool(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('postSceAddSchool', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'POST',
        url: '/service-manager/sce-add-school',
        body: {
          timezone: '1',
          urn: '123456',
          schoolName: 'Test School'
        }
      }

      spyOn(sceService, 'getSchools')
        .and.returnValue([{ id: 1, name: 'Test School', urn: 123456 }])
    })

    it('redirects to the sce settings page when successfully added a school', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceSchoolValidator, 'validate').and.returnValue(new ValidationError())
      spyOn(res, 'redirect')
      spyOn(sceService, 'insertOrUpdateSceSchool')
      await controller.postSceAddSchool(req, res, next)
      expect(sceService.insertOrUpdateSceSchool).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })

    it('calls next when insert or update failed', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceSchoolValidator, 'validate').and.returnValue(new ValidationError())
      spyOn(res, 'redirect')
      spyOn(sceService, 'insertOrUpdateSceSchool').and.returnValue(Promise.reject(new Error('error')))
      await controller.postSceAddSchool(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('renders sce add school if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const validationError = new ValidationError()
      validationError.addError('schoolName', true)
      spyOn(sceSchoolValidator, 'validate').and.returnValue(validationError)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      await controller.postSceAddSchool(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })

  describe('getSceRemoveSchool', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-manager/sce-settings/remove-school',
        params: {
          urn: 123456
        }
      }
    })

    it('should flash the deleted message and call redirect after removing school', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceService, 'removeSceSchool').and.returnValue([[], { name: 'Test School' }])
      spyOn(res, 'redirect')
      await controller.getSceRemoveSchool(req, res, next)
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(sceService.removeSceSchool).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should throw an error when removing a school fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(sceService, 'removeSceSchool').and.returnValue(Promise.reject(new Error('error')))
      spyOn(res, 'redirect')
      await controller.getSceRemoveSchool(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
  describe('getServiceMessage', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-manager/service-message'
      }
    })
    it('should render the service message overview page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const redisResult = JSON.stringify({ title: 'title' })
      spyOn(administrationMessageService, 'getMessage').and.returnValue(redisResult)
      spyOn(res, 'render')
      await controller.getServiceMessage(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
    it('should call administrationMessageService.getMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'getMessage')
      await controller.getServiceMessage(req, res, next)
      expect(administrationMessageService.getMessage).toHaveBeenCalled()
    })
  })
  describe('getServiceMessageForm', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-manager/service-message/service-message-form'
      }
    })
    it('should render the create service message page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render')
      await controller.getServiceMessageForm(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('postSubmitServiceMessage', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'POST',
        url: '/service-manager/service-message/submit-service-message'
      }
    })
    it('should call administrationMessageProcessingService.submitServiceMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageProcessingService, 'submitServiceMessage')
      spyOn(controller, 'getServiceMessage')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(administrationMessageProcessingService.submitServiceMessage).toHaveBeenCalled()
    })
    it('should display the same page if a validation error is present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      spyOn(administrationMessageProcessingService, 'submitServiceMessage').and.returnValue(validationError)
      spyOn(controller, 'getServiceMessageForm')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(controller.getServiceMessageForm).toHaveBeenCalled()
    })
    it('should redirect to the overview page if a validation error is not present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageProcessingService, 'submitServiceMessage')
      spyOn(res, 'redirect')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })
  })
  describe('getEditServiceMessage', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-manager//service-message/edit-service-message'
      }
    })
    it('should call administrationMessageService.getMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'getMessage')
      await controller.getEditServiceMessage(req, res, next)
      expect(administrationMessageService.getMessage).toHaveBeenCalled()
    })
  })
  describe('postRemoveServiceMessage', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'POST',
        url: '/service-manager/service-message/remove-service-message'
      }
    })
    it('should call administrationMessageService.dropMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'dropMessage')
      await controller.postRemoveServiceMessage(req, res, next)
      expect(administrationMessageService.dropMessage).toHaveBeenCalled()
    })
  })
})
