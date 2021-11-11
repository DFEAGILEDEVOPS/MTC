/* global jasmine describe expect it beforeEach spyOn test jest afterEach */
const uuid = require('uuid')
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
const schoolService = require('../../../services/school.service')
const organisationBulkUploadService = require('../../../services/organisation-bulk-upload.service')

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

  describe('getManageSchools', () => {
    let goodReq
    beforeEach(() => {
      goodReq = {
        method: 'GET',
        url: '/service-manager/organisations'
      }
    })

    it('it renders the organisation hub page', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      spyOn(res, 'render')
      await controller.getManageSchools(req, res, next)
      const args = res.render.calls.mostRecent().args
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/manage-organisations-hub')
    })
  })

  describe('getSearch', () => {
    let goodReq
    beforeEach(() => {
      goodReq = {
        method: 'GET',
        url: '/service-manager/organisations/search'
      }
    })

    it('renders the search page', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      spyOn(res, 'render')
      await controller.getSearch(req, res, next)
      const args = res.render.calls.mostRecent().args
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/organisations-search')
    })
  })

  describe('postSearch', () => {
    let goodReq
    const mockSchool = {
      id: 1,
      name: 'test school',
      dfeNumber: 9991001,
      urn: 123456,
      urlSlug: 'abc-slug',
      leaCode: 999,
      estabCode: 1001
    }
    beforeEach(() => {
      goodReq = {
        method: 'POST',
        url: '/service-manager/organisations/search',
        body: {
          q: '123456'
        }
      }
    })

    it('redirects to the view page if a school is found', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(schoolService, 'searchForSchool').and.returnValue(Promise.resolve(mockSchool))
      await controller.postSearch(req, res, next)
      const args = res.redirect.calls.mostRecent()?.args
      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(args[0]).toBe(`/service-manager/organisations/${encodeURIComponent(mockSchool.urlSlug).toLowerCase()}`)
    })

    it('renders the search page if the school is not found', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(schoolService, 'searchForSchool').and.returnValue(Promise.resolve(undefined))
      await controller.postSearch(req, res, next)
      const args = res.render.calls.mostRecent()?.args
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/organisations-search')
    })

    it('renders the search page if the user does not type in a query', async () => {
      const res = getRes()
      const req = getReq({
        method: 'POST',
        url: '/service-manager/organisations/search',
        body: {
          q: ''
        }
      })
      spyOn(res, 'redirect')
      spyOn(res, 'render')
      spyOn(schoolService, 'searchForSchool')
      await controller.postSearch(req, res, next)
      const args = res.render.calls.mostRecent()?.args
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/organisations-search')
      const validationError = args[1].error
      expect(validationError.get('q')).toBe('No query provided')
    })
  })

  describe('getViewOrganisation', () => {
    const mockSchool = {
      id: 1,
      name: 'test school',
      dfeNumber: 9991001,
      urn: 123456,
      urlSlug: 'abc-slug',
      leaCode: 999,
      estabCode: 1001
    }
    it('retrieves the organisation details', async () => {
      const res = getRes()
      const req = getReq()
      spyOn(schoolService, 'findOneBySlug').and.returnValue(Promise.resolve(mockSchool))
      await controller.getViewOrganisation(req, res, next)
      expect(schoolService.findOneBySlug).toHaveBeenCalled()
    })

    it('renders the organisation detail page', async () => {
      const res = getRes()
      const req = getReq()
      spyOn(res, 'render')
      spyOn(schoolService, 'findOneBySlug').and.returnValue(Promise.resolve(mockSchool))
      await controller.getViewOrganisation(req, res, next)
      const args = res.render.calls.mostRecent()?.args
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/organisation-detail')
    })
  })

  describe('getEditOrganisation', () => {
    test('throws if the school is not found', async () => {
      const params = {
        slug: uuid.NIL
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(undefined)
      await controller.getEditOrganisation(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    test('calls res.render', async () => {
      const params = {
        slug: uuid.NIL
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(res, 'render')
      const school = {
        name: 'Test school',
        dfeNumber: 9991999,
        leaCode: 999,
        estabCode: 1999,
        urn: 888900
      }
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(school)
      await controller.getEditOrganisation(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })

    test('by default it shows the same defaults as the school', async () => {
      const params = {
        slug: uuid.NIL
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(res, 'render')
      const school = {
        name: 'Test school',
        dfeNumber: 1111,
        leaCode: 2222,
        estabCode: 3333,
        urn: 4444
      }
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(school)
      await controller.getEditOrganisation(req, res, next)
      expect(res.render).toHaveBeenCalled()
      const args = res.render.mock.calls
      const defaults = args[0][1]?.defaults
      expect(defaults.name).toBe('Test school')
      expect(defaults.dfeNumber).toBe(1111)
      expect(defaults.leaCode).toBe(2222)
      expect(defaults.estabCode).toBe(3333)
      expect(defaults.urn).toBe(4444)
    })

    test('when called from the post with user-supplied defaults it uses the shows the user-supplied ones', async () => {
      const params = {
        slug: uuid.NIL
      }
      const req = getReq(params)
      req.body = {
        name: 'updated name',
        dfeNumber: 5555,
        leaCode: 6666,
        estabCode: 7777,
        urn: 8888
      }
      const res = getRes()
      jest.spyOn(res, 'render')
      const school = {
        name: 'Test school',
        dfeNumber: 1111,
        leaCode: 2222,
        estabCode: 3333,
        urn: 4444
      }
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(school)
      await controller.getEditOrganisation(req, res, next)
      expect(res.render).toHaveBeenCalled()
      const args = res.render.mock.calls
      const defaults = args[0][1]?.defaults
      expect(defaults.name).toBe('updated name')
      expect(defaults.dfeNumber).toBe(5555)
      expect(defaults.leaCode).toBe(6666)
      expect(defaults.estabCode).toBe(7777)
      expect(defaults.urn).toBe(8888)
    })
  })

  describe('postEditOrganisation', () => {
    test('it redirects if the school is not found', async () => {
      const res = getRes()
      const req = getReq({ slug: uuid.NIL })
      jest.spyOn(res, 'redirect')
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(undefined)
      await controller.postEditOrganisation(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })

    test('happy path: it converts the incoming strings to JS types suitable for the service, and calls the service' +
      ' to persist the data', async () => {
      const res = getRes()
      const req = getReq()
      req.body = {
        name: ' updated name ',
        dfeNumber: 5555,
        leaCode: 6666,
        estabCode: 7777,
        urn: 8888
      }
      const school = {
        name: 'Test school',
        dfeNumber: 9991999,
        leaCode: 999,
        estabCode: 1999,
        urn: 888900
      }
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(school)
      jest.spyOn(schoolService, 'updateSchool').mockImplementation(_ => { return Promise.resolve() })
      await controller.postEditOrganisation(req, res, next)
      const args = schoolService.updateSchool.mock.calls[0][1]
      expect(args.name).toBe('updated name')
      expect(args.dfeNumber).toBe(5555)
      expect(args.leaCode).toBe(6666)
      expect(args.estabCode).toBe(7777)
      expect(args.urn).toBe(8888)
    })

    test('if there is a validation error then the user is redirected to the edit page to correct the errors', async () => {
      const res = getRes()
      const req = getReq()
      req.body = {
        name: ' updated name ',
        dfeNumber: 5555,
        leaCode: 6666,
        estabCode: 7777,
        urn: 8888
      }
      const school = {
        name: 'Test school',
        dfeNumber: 9991999,
        leaCode: 999,
        estabCode: 1999,
        urn: 888900
      }
      jest.spyOn(res, 'redirect')
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(school)
      jest.spyOn(schoolService, 'updateSchool').mockRejectedValue(new ValidationError('leacCode', 'Unit test error' +
        ' message'))
      jest.spyOn(controller, 'getEditOrganisation').mockImplementation(_ => { return Promise.resolve() })
      await controller.postEditOrganisation(req, res, next)
      expect(controller.getEditOrganisation).toHaveBeenCalled()
    })
  })

  describe('getUploadOrganisations', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('if called with a job slug it gets the job status', async () => {
      const params = {
        url: '/service-manager/organisations/upload/00000000-0000-0000-0000-000000000000',
        method: 'GET',
        params: {
          jobSlug: '00000000-0000-0000-0000-000000000000'
        }
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(res, 'render')
      const fileStatus = {
        description: 'Submitted',
        code: 'SUB',
        errorOutput: '',
        jobOutput: { stdout: '', stderr: '' }
      }
      jest.spyOn(organisationBulkUploadService, 'getUploadStatus').mockResolvedValue(fileStatus)
      await controller.getUploadOrganisations(req, res, next)
      expect(organisationBulkUploadService.getUploadStatus).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
      const args = res.render.mock.calls[0][1]
      expect(args.jobStatus).toEqual(fileStatus)
    })

    test('if called without a job slug it does not get the jobStatus', async () => {
      const params = {
        url: '/service-manager/organisations/upload',
        method: 'GET',
        params: {}
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(organisationBulkUploadService, 'getUploadStatus').mockImplementation()
      jest.spyOn(res, 'render')
      await controller.getUploadOrganisations(req, res, next)
      expect(organisationBulkUploadService.getUploadStatus).not.toHaveBeenCalled()
      const args = res.render.mock.calls[0][1]
      expect(args.jobStatus).toBeUndefined()
    })

    test('it calls next() if something throws', async () => {
      const params = {
        url: '/service-manager/organisations/upload/00000000-0000-0000-0000-000000000000',
        method: 'GET',
        params: {
          jobSlug: '00000000-0000-0000-0000-000000000000'
        }
      }
      const req = getReq(params)
      const res = getRes()
      // there is only one call we can setup to throw, outside of the render method.
      jest.spyOn(organisationBulkUploadService, 'getUploadStatus').mockRejectedValue(new Error('mock error'))
      await controller.getUploadOrganisations(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('postUploadOrganisations', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('it uploads the file to Azure', async () => {
      const params = {
        url: '/service-manager/organisations/upload',
        method: 'POST',
        params: {},
        files: {
          fileOrganisations: {
            path: '/tmp/foo.csv',
            file: 'foo.csv'
          }
        }
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(res, 'redirect')
      // ensure the validation passes. It actually reads the file from disk, so mock it
      jest.spyOn(organisationBulkUploadService, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(organisationBulkUploadService, 'upload').mockResolvedValue(uuid.NIL)

      await controller.postUploadOrganisations(req, res, next)

      expect(res.redirect).toHaveBeenCalled()
    })

    test('it calls next() if something throws', async () => {
      const params = {
        url: '/service-manager/organisations/upload',
        method: 'POST',
        params: {},
        files: {
          fileOrganisations: {
            path: '/tmp/foo.csv',
            file: 'foo.csv'
          }
        }
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(res, 'redirect')
      // ensure the validation passes. It actually reads the file from disk, so mock it
      jest.spyOn(organisationBulkUploadService, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(organisationBulkUploadService, 'upload').mockRejectedValue(new Error('mock error'))

      await controller.postUploadOrganisations(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    test('it calls getUploadOrganisation() if the validator detects an error', async () => {
      const params = {
        url: '/service-manager/organisations/upload',
        method: 'POST',
        params: {},
        files: {
          fileOrganisations: {
            path: '/tmp/foo.csv',
            file: 'foo.csv'
          }
        }
      }
      const req = getReq(params)
      const res = getRes()
      jest.spyOn(controller, 'getUploadOrganisations').mockImplementation()
      // ensure the validation fails.
      jest.spyOn(organisationBulkUploadService, 'validate').mockResolvedValue(new ValidationError('foo', 'mock error'))

      await controller.postUploadOrganisations(req, res, next)

      expect(controller.getUploadOrganisations).toHaveBeenCalled()
    })
  })

  describe('downloadJobOutput', () => {
    let req, res
    const params = {
      url: '/service-manager/job-output/00000000-0000-0000-0000-000000000000',
      method: 'GET',
      params: {
        jobSlug: '00000000-0000-0000-0000-000000000000'
      }
    }
    beforeEach(() => {
      jest.spyOn(organisationBulkUploadService, 'getZipResults').mockResolvedValue('zipData')
      req = getReq(params)
      res = getRes()
    })

    test('it makes a call to the service to get the results', async () => {
      await controller.downloadJobOutput(req, res, next)
      expect(organisationBulkUploadService.getZipResults).toHaveBeenCalledTimes(1)
    })

    test('it downloads the file as an attachment', async () => {
      await controller.downloadJobOutput(req, res, next)
      expect(res.get('Content-Disposition')).toBe('attachment; filename="job-output.zip"')
      expect(res.get('Content-Type')).toBe('application/octet-stream')
    })

    test('it calls next() on error', async () => {
      jest.spyOn(organisationBulkUploadService, 'getZipResults').mockRejectedValueOnce(new Error('mock error'))
      await controller.downloadJobOutput(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('mock error'))
    })
  })
})
