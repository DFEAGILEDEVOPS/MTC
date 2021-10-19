/* global describe expect beforeEach afterEach test jest */
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

describe('service manager controller:', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    jest.spyOn(res, 'render').mockImplementation()
    jest.spyOn(res, 'redirect').mockImplementation()
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
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

  describe('getServiceManagerHome', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/service-manager/home'
    }

    test('renders the service manager home page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
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

    test('renders the custom timings page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(settingService, 'get').mockResolvedValue(null)
      await controller.getUpdateTiming(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })

    test('throws an error if settings call is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(settingService, 'get').mockRejectedValue(new Error('error'))
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

    test('calls redirect after successful update', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(settingsValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(settingService, 'update').mockImplementation()
      await controller.setUpdateTiming(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
      expect(settingService.update).toHaveBeenCalled()
    })

    test('renders check settings if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const validationError = new ValidationError()
      validationError.addError('adminDateInvalid', true)
      jest.spyOn(settingsValidator, 'validate').mockResolvedValue(validationError)
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

    test('renders the upload pupil census page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilCensusService, 'getUploadedFile').mockImplementation()
      jest.spyOn(uploadedFileService, 'getFilesize').mockImplementation()
      await controller.getUploadPupilCensus(req, res, next)
      expect(pupilCensusService.getUploadedFile).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    test('throws an error if fetching existing pupil census fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(uploadedFileService, 'getFilesize').mockImplementation()
      jest.spyOn(pupilCensusService, 'getUploadedFile').mockImplementation(() => {
        throw new Error('error')
      })
      await controller.getUploadPupilCensus(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('error'))
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

    test('redirects to pupil census page when successfully uploaded a csv file', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilCensusService, 'process').mockResolvedValue(new ValidationError())
      jest.spyOn(pupilCensusService, 'upload2').mockImplementation()
      await controller.postUploadPupilCensus(req, res, next)
      expect(pupilCensusService.process).toHaveBeenCalled()
      expect(pupilCensusService.upload2).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })

    test('calls next when upload is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilCensusService, 'process').mockResolvedValue(new ValidationError())
      jest.spyOn(pupilCensusService, 'upload2').mockImplementation(() => {
        throw new Error('error')
      })
      await controller.postUploadPupilCensus(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    test('calls getUploadPupilCensus with validation error when there is a file error', async () => {
      const res = getRes()
      const req = getReq(badReqParams)
      const validationError = new ValidationError()
      validationError.addError('upload-element', 'error')
      jest.spyOn(pupilCensusService, 'process').mockResolvedValue(validationError)
      jest.spyOn(pupilCensusService, 'upload2').mockImplementation()
      jest.spyOn(controller, 'getUploadPupilCensus').mockImplementation()
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

    test('redirects to pupil census page when successfully removed the selected pupil', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilCensusService, 'remove').mockImplementation()
      await controller.getRemovePupilCensus(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })

    test('calls next when upload is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilCensusService, 'remove').mockImplementation(() => {
        throw new Error('test error')
      })
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

    test('should render after fetching schools', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'getSceSchools').mockResolvedValue([{ name: 'school', urn: '42' }])
      jest.spyOn(scePresenter, 'getCountriesTzData').mockResolvedValue([])
      await controller.getSceSettings(req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(sceService.getSceSchools).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('should throw an error when fetching schools call is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'getSceSchools').mockImplementation(() => {
        throw new Error('error')
      })
      jest.spyOn(scePresenter, 'getCountriesTzData').mockReturnValue([])
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

    test('redirect to the index page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
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
      jest.spyOn(sceService, 'getSceSchools')
        .mockResolvedValue([{ id: 1, name: 'Test School', urn: 123456 }])
    })

    test('redirects to the sce settings page when successfully applied changes', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'applySceSettings').mockImplementation()
      await controller.postSceSettings(req, res, next)
      expect(sceService.applySceSettings).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })

    test('calls next when applying sce settings throws', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'applySceSettings').mockImplementation(() => {
        throw new Error('test error')
      })
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

    test('calls render after fetching schools', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'getSchools').mockResolvedValue([{ name: 'school', urn: '42' }])
      await controller.getSceAddSchool(req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(sceService.getSchools).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('throws an error when fetching schools call is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'getSchools').mockImplementation(() => {
        throw new Error('test error')
      })
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

      jest.spyOn(sceService, 'getSchools')
        .mockResolvedValue([{ id: 1, name: 'Test School', urn: 123456 }])
    })

    test('redirects to the sce settings page when successfully added a school', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceSchoolValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(sceService, 'insertOrUpdateSceSchool').mockImplementation()
      await controller.postSceAddSchool(req, res, next)
      expect(sceService.insertOrUpdateSceSchool).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })

    test('calls next when insert or update failed', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceSchoolValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(sceService, 'insertOrUpdateSceSchool').mockImplementation(() => {
        throw new Error('test error')
      })
      await controller.postSceAddSchool(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    test('renders sce add school if validator error occurs', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const validationError = new ValidationError()
      validationError.addError('schoolName', true)
      jest.spyOn(sceSchoolValidator, 'validate').mockResolvedValue(validationError)
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

    test('should flash the deleted message and call redirect after removing school', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'removeSceSchool').mockResolvedValue([[], { name: 'Test School' }])
      await controller.getSceRemoveSchool(req, res, next)
      expect(req.flash).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(sceService.removeSceSchool).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('should throw an error when removing a school fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(sceService, 'removeSceSchool').mockImplementation(() => {
        throw new Error('error')
      })
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

    test('it renders the organisation hub page', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      await controller.getManageSchools(req, res, next)
      const args = res.render.mock.calls[0]
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

    test('renders the search page', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      await controller.getSearch(req, res, next)
      const args = res.render.mock.calls[0]
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

    test('redirects to the view page if a school is found', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      jest.spyOn(schoolService, 'searchForSchool').mockResolvedValue(mockSchool)
      await controller.postSearch(req, res, next)
      const args = res.redirect.mock.calls[0]
      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(args[0]).toBe(`/service-manager/organisations/${encodeURIComponent(mockSchool.urlSlug).toLowerCase()}`)
    })

    test('renders the search page if the school is not found', async () => {
      const res = getRes()
      const req = getReq(goodReq)
      jest.spyOn(schoolService, 'searchForSchool').mockResolvedValue(undefined)
      await controller.postSearch(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/organisations-search')
    })

    test('renders the search page if the user does not type in a query', async () => {
      const res = getRes()
      const req = getReq({
        method: 'POST',
        url: '/service-manager/organisations/search',
        body: {
          q: ''
        }
      })
      jest.spyOn(schoolService, 'searchForSchool').mockImplementation()
      await controller.postSearch(req, res, next)
      const args = res.render.mock.calls[0]
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

    test('retrieves the organisation details', async () => {
      const res = getRes()
      const req = getReq()
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(mockSchool)
      await controller.getViewOrganisation(req, res, next)
      expect(schoolService.findOneBySlug).toHaveBeenCalled()
    })

    test('renders the organisation detail page', async () => {
      const res = getRes()
      const req = getReq()
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(mockSchool)
      await controller.getViewOrganisation(req, res, next)
      const args = res.render.mock.calls[0]
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
      jest.spyOn(res, 'render').mockImplementation()
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
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(school)
      jest.spyOn(schoolService, 'updateSchool').mockRejectedValue(new ValidationError('leacCode', 'Unit test error' +
        ' message'))
      jest.spyOn(controller, 'getEditOrganisation').mockImplementation(_ => { return Promise.resolve() })
      await controller.postEditOrganisation(req, res, next)
      expect(controller.getEditOrganisation).toHaveBeenCalled()
    })
  })

  describe('getAddSchool', () => {
    test('it renders the add-school page', async () => {
      const req = getReq()
      const res = getRes()
      await controller.getAddSchool(req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(res.render.mock.calls[0][0]).toBe('service-manager/add-school')
    })

    test('calls next if there is an error thrown', async () => {
      const req = getReq()
      const res = getRes()
      jest.spyOn(res, 'render').mockImplementation(() => {
        throw new Error('test error')
      })
      await controller.getAddSchool(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('postAddSchool', () => {
    test('it calls the service to add the school and then issues a redirect', async () => {
      const req = getReq({
        body: {
          name: 'Primary Academy',
          dfeNumber: '1231234',
          urn: '123456'
        }
      })
      const res = getRes()
      jest.spyOn(schoolService, 'addSchool').mockImplementation()
      await controller.postAddSchool(req, res, next)
      expect(schoolService.addSchool).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/service-manager/organisations')
    })

    test('it displays the page again if the validation fails', async () => {
      const req = getReq({
        body: {
          name: 'Primary Academy',
          dfeNumber: '1231234',
          urn: '123456'
        }
      })
      const res = getRes()
      jest.spyOn(schoolService, 'addSchool').mockImplementation(() => {
        throw new ValidationError('mock', 'test error')
      })
      jest.spyOn(controller, 'getAddSchool').mockImplementation()
      await controller.postAddSchool(req, res, next)
      expect(controller.getAddSchool).toHaveBeenCalled()
    })

    test('it calls next if an error is thrown that is not a validation error', async () => {
      const req = getReq({
        body: {
          name: 'Primary Academy',
          dfeNumber: '1231234',
          urn: '123456'
        }
      })
      const res = getRes()
      jest.spyOn(schoolService, 'addSchool').mockImplementation(() => {
        throw new Error('test error')
      })
      jest.spyOn(controller, 'getAddSchool').mockImplementation()
      await controller.postAddSchool(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('test error'))
    })
  })
})
