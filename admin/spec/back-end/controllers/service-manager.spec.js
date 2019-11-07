/* global jasmine describe expect it beforeEach spyOn */
const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/service-manager')
const settingService = require('../../../services/setting.service')
const sceService = require('../../../services/sce.service')
const pupilCensusService = require('../../../services/pupil-census.service')
const sceSchoolValidator = require('../../../lib/validator/sce-school-validator')
const scePresenter = require('../../../helpers/sce')
const uploadedFileService = require('../../../services/uploaded-file.service')
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
    const goodReqParams = {
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
    const goodReqParams = {
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
    const goodReqParams = {
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

  describe('getUploadPupilCensus', () => {
    const goodReqParams = {
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
    const goodReqParams = {
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
})
