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
const auditOperationTypes = require('../../../lib/consts/audit-entry-types')
const { JobService } = require('../../../services/job/job.service')
const { ServiceManagerPupilDataService } = require('../../../services/service-manager/pupil/service-manager.pupil.data.service')
const { ServiceManagerPupilService } = require('../../../services/service-manager/pupil/service-manager.pupil.service')
const { TypeOfEstablishmentService } = require('../../../services/type-of-establishment/type-of-establishment-service')
const moment = require('moment-timezone')
const { ServiceManagerSchoolService } = require('../../../services/service-manager/school/school.service')
const { PupilFreezeService } = require('../../../services/service-manager/pupil-freeze/pupil-freeze.service')
const { ServiceManagerAttendanceService } = require('../../../services/service-manager/attendance/service-manager.attendance.service')

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
      jest.spyOn(uploadedFileService, 'getFilesize').mockImplementation()
      await controller.getUploadPupilCensus(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })

    test('throws an error if fetching existing pupil census fails', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(uploadedFileService, 'getFilesize').mockImplementation(() => {
        throw new Error('error')
      })
      await controller.getUploadPupilCensus(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('error'))
      expect(uploadedFileService.getFilesize).toHaveBeenCalled()
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
      jest.spyOn(pupilCensusService, 'validateFile').mockResolvedValue(new ValidationError())
      jest.spyOn(pupilCensusService, 'upload2').mockImplementation()
      await controller.postUploadPupilCensus(req, res, next)
      expect(pupilCensusService.validateFile).toHaveBeenCalled()
      expect(pupilCensusService.upload2).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })

    test('calls next when upload is rejected', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilCensusService, 'validateFile').mockResolvedValue(new ValidationError())
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
      jest.spyOn(pupilCensusService, 'validateFile').mockResolvedValue(validationError)
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

      jest.spyOn(sceService, 'getSchools').mockResolvedValue([{ id: 1, name: 'Test School', urn: 123456 }])
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

    const mockAudits = [
      {
        createdAt: '2022-01-14 13:53:12',
        auditOperation: auditOperationTypes.update,
        user: 'foo bar'
      },
      {
        createdAt: '2022-01-17 14:22:11',
        auditOperation: auditOperationTypes.update,
        user: 'john smith'
      }
    ]

    test('retrieves the organisation details', async () => {
      const res = getRes()
      const req = getReq()
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(mockSchool)
      jest.spyOn(schoolService, 'getSchoolAudits').mockResolvedValue(mockAudits)
      await controller.getViewOrganisation(req, res, next)
      expect(schoolService.findOneBySlug).toHaveBeenCalled()
    })

    test('retrieves the audit entries', async () => {
      const res = getRes()
      const req = getReq()
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(mockSchool)
      jest.spyOn(schoolService, 'getSchoolAudits').mockResolvedValue(mockAudits)
      await controller.getViewOrganisation(req, res, next)
      expect(schoolService.findOneBySlug).toHaveBeenCalled()
      expect(schoolService.getSchoolAudits).toHaveBeenCalled()
    })

    test('renders the organisation detail page', async () => {
      const res = getRes()
      const req = getReq()
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(mockSchool)
      jest.spyOn(schoolService, 'getSchoolAudits').mockResolvedValue(mockAudits)
      await controller.getViewOrganisation(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/organisation-detail')
    })
  })

  describe('getEditOrganisation', () => {
    beforeEach(() => {
      jest.spyOn(TypeOfEstablishmentService, 'getEstablishmentDataSortedByName').mockResolvedValue([
        { code: 10, name: 'Type 10' },
        { code: 46, name: 'Type 46' }
      ])
    })

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
        urn: 4444,
        typeOfEstablishmentCode: 10
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
      expect(defaults.typeOfEstablishmentCode).toBe(10)
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
        urn: 8888,
        typeOfEstablishmentCode: 46
      }
      const res = getRes()
      jest.spyOn(res, 'render').mockImplementation()
      const school = {
        name: 'Test school',
        dfeNumber: 1111,
        leaCode: 2222,
        estabCode: 3333,
        urn: 4444,
        typeOfEstablishmentCode: 10
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
      expect(defaults.typeOfEstablishmentCode).toBe(46)
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

    test('happy path: it converts the incoming strings to JS types suitable for the service, and calls the service to persist the data', async () => {
      const res = getRes()
      const req = getReq()
      const userId = 9999
      req.user = {
        id: userId
      }
      req.body = {
        name: ' updated name ',
        dfeNumber: '5555',
        leaCode: '6666',
        estabCode: '7777',
        urn: '8888',
        typeOfEstablishmentCode: '46'
      }
      const school = {
        name: 'Test school',
        dfeNumber: 9991999,
        leaCode: 999,
        estabCode: 1999,
        urn: 888900,
        typeOfEstablishmentCode: 10
      }
      jest.spyOn(schoolService, 'findOneBySlug').mockResolvedValue(school)
      jest.spyOn(schoolService, 'updateSchool').mockImplementation(_ => { return Promise.resolve() })
      await controller.postEditOrganisation(req, res, next)
      const schoolUpdateArg = schoolService.updateSchool.mock.calls[0][1]
      expect(schoolUpdateArg.name).toBe('updated name')
      expect(schoolUpdateArg.dfeNumber).toBe(5555)
      expect(schoolUpdateArg.leaCode).toBe(6666)
      expect(schoolUpdateArg.estabCode).toBe(7777)
      expect(schoolUpdateArg.urn).toBe(8888)
      const userIdArg = schoolService.updateSchool.mock.calls[0][2]
      expect(userIdArg).toEqual(userId)
    })

    test('if there is a validation error then the user is redirected to the edit page to correct the errors', async () => {
      const res = getRes()
      const req = getReq()
      req.user = {
        id: 1
      }
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
      jest.spyOn(controller, 'getEditOrganisation').mockImplementation(() => Promise.resolve())
      await controller.postEditOrganisation(req, res, next)
      expect(controller.getEditOrganisation).toHaveBeenCalled()
    })
  })

  describe('getUploadOrganisations', () => {
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
    describe('getAddSchool', () => {
      test('it renders the add-school page', async () => {
        const req = getReq()
        const res = getRes()
        jest.spyOn(TypeOfEstablishmentService, 'getEstablishmentDataSortedByName').mockResolvedValue()
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
        jest.spyOn(TypeOfEstablishmentService, 'getEstablishmentDataSortedByName').mockResolvedValue()
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
            urn: '123456',
            typeOfEstablishmentCode: '999'
          }
        })
        req.user = {
          id: 1
        }
        const res = getRes()
        jest.spyOn(schoolService, 'addSchool').mockResolvedValue({ urlSlug: '00000000-00000000-D0000000-00000000' })
        await controller.postAddSchool(req, res, next)
        expect(schoolService.addSchool).toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/service-manager/organisations/00000000-00000000-d0000000-00000000')
      })

      test('it displays the page again if the validation fails', async () => {
        const req = getReq({
          body: {
            name: 'Primary Academy',
            dfeNumber: '1231234',
            urn: '123456',
            typeOfEstablishmentCode: '999'
          }
        })
        req.user = {
          id: 1
        }
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
        req.user = {
          id: 1
        }
        const res = getRes()
        jest.spyOn(schoolService, 'addSchool').mockImplementation(() => {
          throw new Error('test error')
        })
        jest.spyOn(controller, 'getAddSchool').mockImplementation()
        await controller.postAddSchool(req, res, next)
        expect(next).toHaveBeenCalledWith(new Error('test error'))
      })

      test('it trims the school name', async () => {
        const req = getReq({
          body: {
            name: '  Primary Academy   ',
            dfeNumber: '1231234',
            urn: '123456'
          }
        })
        req.user = {
          id: 1
        }
        const res = getRes()
        jest.spyOn(schoolService, 'addSchool').mockImplementation()
        await controller.postAddSchool(req, res, next)
        const args = schoolService.addSchool.mock.calls[0][0]
        expect(args.name).toBe('Primary Academy')
      })
    })
  })

  describe('job view', () => {
    describe('getJobs', () => {
      test('it renders job summary', async () => {
        jest.spyOn(JobService, 'getJobSummary').mockImplementation()
        const req = getReq()
        const res = getRes()
        await controller.getJobs(req, res, next)
        expect(JobService.getJobSummary).toHaveBeenCalled()
      })
      test('error is passed to handler when thrown', async () => {
        const req = getReq()
        const res = getRes()
        jest.spyOn(JobService, 'getJobSummary').mockImplementation(() => {
          throw new Error('test error')
        })
        await controller.getJobs(req, res, next)
        expect(next).toHaveBeenCalledWith(new Error('test error'))
      })
    })

    describe('getJobOutputs', () => {
      const expectedJobId = 'sdkfjsdkfj-xljx409gh4t'
      test('it renders job outputs', async () => {
        const req = getReq({
          query: {
            urlSlug: expectedJobId
          }
        })
        const res = getRes()
        jest.spyOn(JobService, 'getJobOutputs').mockImplementation()
        await controller.getJobOutputs(req, res, next)
        expect(JobService.getJobOutputs).toHaveBeenCalledWith(expectedJobId)
      })
      test('error is passed to handler when thrown', async () => {
        const req = getReq({
          query: {
            urlSlug: expectedJobId
          }
        })
        const res = getRes()
        jest.spyOn(res, 'send')
        jest.spyOn(res, 'type')
        const expectedError = new Error('test error')
        jest.spyOn(JobService, 'getJobOutputs').mockImplementation(() => {
          throw expectedError
        })
        await controller.getJobOutputs(req, res, next)
        expect(next).toHaveBeenCalledWith(expectedError)
      })
    })
  })

  describe('getPupilSearch', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'GET',
        url: '/service-manager/pupil-search'
      }
    })

    test('renders the pupil search page', async () => {
      const res = getRes()
      const req = getReq(baseReq)
      await controller.getPupilSearch(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/pupil-search')
    })
  })

  describe('postPupilSearch', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'POST',
        url: '/service-manager/pupil-search',
        body: {
          q: 'THIRTE3NCH4RS'
        }
      }
      jest.restoreAllMocks()
    })

    test('shows no query provided error if search box empty', async () => {
      const res = getRes()
      const req = getReq({
        method: 'POST',
        url: '/service-manager/pupil-search',
        body: {
          q: ''
        }
      })
      await controller.postPupilSearch(req, res, next)
      const args = res.render.mock.calls[0]
      const validationError = args[1].error
      expect(validationError.get('q')).toBe('No query provided')
    })

    test('shows invalid input message when invalid upn provided', async () => {
      const res = getRes()
      const req = getReq({
        method: 'POST',
        url: '/service-manager/pupil-search',
        body: {
          q: 'invalid-upn!'
        }
      })
      await controller.postPupilSearch(req, res, next)
      const args = res.render.mock.calls[0]
      const validationError = args[1].error
      expect(validationError.get('q')).toBe('upn should be 13 characters and numbers')
    })

    test('shows no pupil found error if results empty', async () => {
      const res = getRes()
      const req = getReq(baseReq)
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockResolvedValue([])
      await controller.postPupilSearch(req, res, next)
      const args = res.render.mock.calls[0]
      const validationError = args[1].error
      expect(validationError.get('q')).toBe('No pupil found')
    })

    test('redirects straight to the pupil summary if 1 pupil is found', async () => {
      const res = getRes()
      const req = getReq(baseReq)
      const mockUrlSlug = 'my-mock-slug'
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockResolvedValue([{
        urlSlug: mockUrlSlug,
        id: 1,
        firstName: 'string',
        lastName: 'string',
        dateOfBirth: moment('1999-12-30'),
        schoolName: 'string',
        schoolUrn: 12345,
        dfeNumber: 65794
      }])
      await controller.postPupilSearch(req, res, next)
      const args = res.redirect.mock.calls[0]
      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(args[0]).toBe(`/service-manager/pupil-summary/${encodeURIComponent(mockUrlSlug).toLowerCase()}`)
    })

    test('redirects to the search results if more than 1 pupil is found', async () => {
      const res = getRes()
      const req = getReq(baseReq)
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockResolvedValue([
        {
          urlSlug: 'slug1',
          id: 1,
          firstName: 'string',
          lastName: 'string',
          dateOfBirth: moment('1999-12-30'),
          schoolName: 'string',
          schoolUrn: 12345,
          dfeNumber: 65794
        },
        {
          urlSlug: 'slug2',
          id: 2,
          firstName: 'string',
          lastName: 'string',
          dateOfBirth: moment('1999-12-30'),
          schoolName: 'string',
          schoolUrn: 12345,
          dfeNumber: 65794
        }
      ])
      await controller.postPupilSearch(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/pupil-search')
      expect(args[1].results.length).toBe(2)
    })
  })

  describe('getPupilSummary', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'GET'
      }
      jest.restoreAllMocks()
    })

    test('redirects back to search if no pupil slug provided', async () => {
      const req = getReq(baseReq)
      req.params = {}
      const res = getRes()
      jest.spyOn(res, 'redirect')
      await controller.getPupilSummary(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/service-manager/pupil-search/')
    })

    test('it throws an error if pupil slug not valid uuid', async () => {
      const invalidUuid = 'not-a-uuid'
      const req = getReq(baseReq)
      req.params = {
        slug: invalidUuid
      }
      const res = getRes()
      jest.spyOn(res, 'redirect')
      await controller.getPupilSummary(req, res, next)
      expect(res.redirect).not.toHaveBeenCalledWith('/service-manager/pupil-search/')
      expect(next).toHaveBeenCalled()
      const args = next.mock.calls[0]
      expect(args[0].message).toEqual(`${invalidUuid} is not a valid uuid`)
    })

    test('it renders pupil data when found by uuid', async () => {
      const validUuid = '4dc3212a-92ca-46da-b4bc-2cb7881ec593'
      const req = getReq(baseReq)
      req.params = {
        slug: validUuid
      }
      const thePupilData = {
        urlSlug: 'slug1',
        id: 1,
        firstName: 'firstName',
        lastName: 'lastName',
        dateOfBirth: '1999-12-30',
        schoolName: 'school name',
        schoolUrn: 12345,
        dfeNumber: 65794
      }
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue(thePupilData)
      const res = getRes()
      jest.spyOn(res, 'render')
      await controller.getPupilSummary(req, res, next)
      expect(res.render).toHaveBeenCalledWith('service-manager/pupil-summary', {
        breadcrumbs: undefined,
        pupil: thePupilData
      })
    })
  })

  describe('getPupilMove', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'GET',
        url: '/service-manager/pupil/move/123456789',
        params: {
          slug: '123456789'
        }
      }

      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({
        dateOfBirth: '1 March 2019',
        dfeNumber: 9991234,
        firstName: 'First',
        id: 1,
        lastName: 'Last',
        isAnnulled: false,
        middleNames: 'Middle Name',
        schoolId: 2,
        schoolName: 'Test School',
        schoolUrn: 200,
        status: 'Not Started',
        upn: 'G10020344',
        urlSlug: 'B5D5BE3-A522-4B6A-90DF-00133BFE8D07'
      })
    })

    test('renders the pupil move page', async () => {
      const res = getRes()
      const req = getReq(baseReq)
      await controller.getPupilMove(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/pupil/move-form')
    })
  })

  describe('postPupilMove', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'POST',
        url: '/service-manager/pupil/move/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
        params: {
          slug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
        },
        body: {
          pupilUrlSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
          targetSchoolURN: '89002'
        }
      }
    })

    test('it detects when the pupil is empty and shows the form again', async () => {
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({
        dateOfBirth: '1 March 2019',
        dfeNumber: 9991234,
        firstName: 'First',
        id: 1,
        lastName: 'Last',
        isAnnulled: false,
        middleNames: 'Middle Name',
        schoolId: 2,
        schoolName: 'Test School',
        schoolUrn: 200,
        status: 'Not Started',
        upn: 'G10020344',
        urlSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
      })
      baseReq.body.pupilUrlSlug = ''
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilMove(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/pupil/move-form')
    })

    test('it detects when the school is empty and shows the form again', async () => {
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({
        dateOfBirth: '1 March 2019',
        dfeNumber: 9991234,
        firstName: 'First',
        id: 1,
        lastName: 'Last',
        isAnnulled: false,
        middleNames: 'Middle Name',
        schoolId: 2,
        schoolName: 'Test School',
        schoolUrn: 200,
        status: 'Not Started',
        upn: 'G10020344',
        urlSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
      })
      jest.spyOn(ServiceManagerSchoolService, 'findSchoolByUrn').mockResolvedValue({
        id: 3,
        leaCode: 999,
        estabCode: 7777,
        name: 'Test School',
        urlSlug: 'f76d7a46-69a0-4f48-8111-9252d138540a',
        urn: 89002,
        dfeNumber: 9997777
      })
      baseReq.body.targetSchoolURN = '' // error: empty target school
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilMove(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/pupil/move-form')
    })

    test('it checks to see if the target school is the same as the origin school, and shows the form again if so', async () => {
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({
        dateOfBirth: '1 March 2019',
        dfeNumber: 9997777,
        firstName: 'First',
        id: 1,
        lastName: 'Last',
        isAnnulled: false,
        middleNames: 'Middle Name',
        schoolId: 2,
        schoolName: 'Test School',
        schoolUrn: 200,
        status: 'Not Started',
        upn: 'G10020344',
        urlSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
      })
      jest.spyOn(ServiceManagerSchoolService, 'findSchoolByUrn').mockResolvedValue({
        id: 2,
        leaCode: 999,
        estabCode: 7777,
        name: 'Test School',
        urlSlug: 'f76d7a46-69a0-4f48-8111-9252d138540a',
        urn: 200,
        dfeNumber: 9997777
      })
      baseReq.body.targetSchoolURN = '200' // error: this is the same as the school the pupil is currently at
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilMove(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/pupil/move-form')
    })

    test('it catches errors from looking up the school and redirects to the form', async () => {
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({
        dateOfBirth: '1 March 2019',
        dfeNumber: 9997777,
        firstName: 'First',
        id: 1,
        lastName: 'Last',
        isAnnulled: false,
        middleNames: 'Middle Name',
        schoolId: 2,
        schoolName: 'Test School',
        schoolUrn: 200,
        status: 'Not Started',
        upn: 'G10020344',
        urlSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
      })
      jest.spyOn(ServiceManagerSchoolService, 'findSchoolByUrn').mockRejectedValue(new Error('mock error simulating sql error'))
      baseReq.body.targetSchoolURN = '300'
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilMove(req, res, next)
      const args = res.render.mock.calls[0]
      expect(res.render).toHaveBeenCalled()
      expect(args[0]).toBe('service-manager/pupil/move-form')
    })

    test('on success it redirects to the confirmation page', async () => {
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({
        dateOfBirth: '1 March 2019',
        dfeNumber: 9997777,
        firstName: 'First',
        id: 1,
        lastName: 'Last',
        isAnnulled: false,
        middleNames: 'Middle Name',
        schoolId: 2,
        schoolName: 'Test School',
        schoolUrn: 200,
        status: 'Not Started',
        upn: 'G10020344',
        urlSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
      })
      jest.spyOn(ServiceManagerSchoolService, 'findSchoolByUrn').mockResolvedValue({
        id: 4,
        leaCode: 999,
        estabCode: 7775,
        name: 'Test School',
        urlSlug: 'f76d7a46-69a0-4f48-8111-9252d138540a',
        urn: 300,
        dfeNumber: 9997775
      })
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilMove(req, res, next)
      const args = res.redirect.mock.calls[0]
      expect(res.redirect).toHaveBeenCalled()
      expect(args[0]).toBe('/service-manager/pupil/move/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0/confirm/f76d7a46-69a0-4f48-8111-9252d138540a')
    })
  })

  describe('getPupilMoveConfirm', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'GET',
        url: '/service-manager/pupil/move/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0/confirm/f76d7a46-69a0-4f48-8111-9252d138540a',
        params: {
          pupilSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
          schoolSlug: 'f76d7a46-69a0-4f48-8111-9252d138540a'
        }
      }
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({ id: 1 })
      jest.spyOn(ServiceManagerSchoolService, 'findSchoolBySlug').mockResolvedValue({ id: 2 })
    })

    test('it renders the confirmation page', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      await controller.getPupilMoveConfirm(req, res, next)
      expect(res.render).toHaveBeenCalled()
      const args = res.render.mock.calls[0]
      expect(args[0]).toBe('service-manager/pupil/move-confirm')
    })

    test('it handles a pupil db lookup error by redirecting to pupil move page with a flash message', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockRejectedValue(new Error('mock error from testing'))
      jest.spyOn(req, 'flash')
      await controller.getPupilMoveConfirm(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
      const args = res.redirect.mock.calls[0]
      expect(args[0]).toBe('/service-manager/pupil/move/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0')
      const flashArgs = req.flash.mock.calls[0]
      expect(flashArgs[0]).toBe('error')
      expect(flashArgs[1]).toMatch(/Error confirming target school/)
    })

    test('it handles a school db lookup error by redirecting to pupil move page with a flash message', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      jest.spyOn(ServiceManagerSchoolService, 'findSchoolBySlug').mockRejectedValue(new Error('mock error from testing'))
      jest.spyOn(req, 'flash')
      await controller.getPupilMoveConfirm(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
      const args = res.redirect.mock.calls[0]
      expect(args[0]).toBe('/service-manager/pupil/move/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0')
      const flashArgs = req.flash.mock.calls[0]
      expect(flashArgs[0]).toBe('error')
      expect(flashArgs[1]).toMatch(/Error confirming target school/)
    })
  })

  describe('postPupilMoveConfirmed', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'POST',
        url: '/service-manager/pupil/move/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0/confirm/f76d7a46-69a0-4f48-8111-9252d138540a',
        params: {
          pupilSlug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
          schoolSlug: 'f76d7a46-69a0-4f48-8111-9252d138540a'
        },
        user: {
          id: '102'
        }
      }
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({ id: 1 })
      jest.spyOn(ServiceManagerSchoolService, 'findSchoolBySlug').mockResolvedValue({ id: 2 })
      jest.spyOn(ServiceManagerPupilService, 'movePupilToSchool').mockResolvedValue()
    })

    test('it moves the pupil to the new school', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilMoveConfirmed(req, res, next)
      expect(ServiceManagerPupilService.movePupilToSchool).toHaveBeenCalled()
    })

    test('on error it redirects back to the pupil move summary and shows a flash message', async function () {
      const req = getReq(baseReq)
      const res = getRes()
      jest.spyOn(req, 'flash')
      jest.spyOn(ServiceManagerPupilService, 'movePupilToSchool').mockRejectedValue(new Error('mock error from unit test'))
      await controller.postPupilMoveConfirmed(req, res)
      expect(req.flash).toHaveBeenCalled()
      const flashArgs = req.flash.mock.calls[0]
      expect(flashArgs[0]).toBe('error')
      expect(flashArgs[1]).toBe('mock error from unit test')
      expect(res.redirect).toHaveBeenCalled()
      const redirectArgs = res.redirect.mock.calls[0]
      expect(redirectArgs[0]).toBe('/service-manager/pupil/move/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0')
    })
  })

  describe('getPupilFreeze', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'GET',
        url: '/service-manager/pupil/freeze/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
        params: {
          slug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
        }
      }
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({ id: 1 })
    })

    test('it renders the confirmation page', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      await controller.getPupilFreeze(req, res, next)
      expect(res.render).toHaveBeenCalled()
      const args = res.render.mock.calls[0]
      expect(args[0]).toBe('service-manager/pupil/freeze')
    })
  })

  describe('postPupilFreeze', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'POST',
        url: '/service-manager/pupil/freeze/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
        params: {
          slug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
        },
        body: {
          upn: 'GOODUPN'
        },
        user: {
          id: 42
        }
      }
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({ id: 1, upn: 'GOODUPN' })
      jest.spyOn(PupilFreezeService, 'applyFreeze').mockImplementation()
      jest.spyOn(controller, 'getPupilFreeze')
    })

    test('shows the form again if the upn is not provided', async () => {
      // Call the post handler, which errors out, and then calls the get handler to redisplay the form
      baseReq.body.upn = '' // the user fails to supply a UPN
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilFreeze(req, res, next)
      expect(controller.getPupilFreeze).toHaveBeenCalled()
      const validationErrorArg = controller.getPupilFreeze.mock.calls[0][3]
      expect(validationErrorArg.errors.upn).toBe('No upn provided')
    })

    test('shows the form again if the upn does not match the expected value from the db', async () => {
      // Call the post handler, which errors out, and then calls the get handler to redisplay the form
      baseReq.body.upn = 'BADUPN'
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilFreeze(req, res, next)
      expect(controller.getPupilFreeze).toHaveBeenCalled()
      const validationErrorArg = controller.getPupilFreeze.mock.calls[0][3]
      expect(validationErrorArg.errors.upn).toBe('UPN does not match pupil')
    })

    test('calls the freeze service to apply make the pupil read-only', async () => {
      // Call the post handler, which errors out, and then calls the get handler to redisplay the form
      baseReq.body.upn = 'GOODUPN'
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilFreeze(req, res, next)
      expect(PupilFreezeService.applyFreeze).toHaveBeenCalled()
    })

    test('handles unexpected errors by showing the form page again', async () => {
      // Careful here.  This call (getPupilDetailsByUrlSlug) is also used in the GET handler, which we want to succeed in this case.
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockRejectedValueOnce(new Error('mock error'))
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilFreeze(req, res, next)
      expect(controller.getPupilFreeze).toHaveBeenCalled()
      const validationErrorArg = controller.getPupilFreeze.mock.calls[0][3]
      expect(validationErrorArg.errors.upn).toBe('mock error')
    })
  })

  describe('getPupilThaw', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'GET',
        url: '/service-manager/pupil/thaw/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
        params: {
          slug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
        }
      }
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({ id: 1 })
    })

    test('it renders the confirmation page', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      await controller.getPupilThaw(req, res, next)
      expect(res.render).toHaveBeenCalled()
      const args = res.render.mock.calls[0]
      expect(args[0]).toBe('service-manager/pupil/thaw')
    })
  })

  describe('postPupilThaw', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'POST',
        url: '/service-manager/pupil/thaw/daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0',
        params: {
          slug: 'daeb9d73-8b55-4b06-8ae2-6c0dbee03bd0'
        },
        body: {
          upn: 'GOODUPN'
        },
        user: {
          id: 42
        }
      }
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockResolvedValue({ id: 1, upn: 'GOODUPN' })
      jest.spyOn(PupilFreezeService, 'applyThaw').mockImplementation()
      jest.spyOn(controller, 'getPupilThaw')
    })

    test('shows the form again if the upn is not provided', async () => {
      // Call the post handler, which errors out, and then calls the get handler to redisplay the form
      baseReq.body.upn = '' // the user fails to supply a UPN
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilThaw(req, res, next)
      expect(controller.getPupilThaw).toHaveBeenCalled()
      const validationErrorArg = controller.getPupilThaw.mock.calls[0][3]
      expect(validationErrorArg.errors.upn).toBe('No upn provided')
    })

    test('shows the form again if the upn does not match the expected value from the db', async () => {
      // Call the post handler, which errors out, and then calls the get handler to redisplay the form
      baseReq.body.upn = 'BADUPN'
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilThaw(req, res, next)
      expect(controller.getPupilThaw).toHaveBeenCalled()
      const validationErrorArg = controller.getPupilThaw.mock.calls[0][3]
      expect(validationErrorArg.errors.upn).toBe('UPN does not match pupil')
    })

    test('calls the freeze service to apply make the pupil read-only', async () => {
      // Call the post handler, which errors out, and then calls the get handler to redisplay the form
      baseReq.body.upn = 'GOODUPN'
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilThaw(req, res, next)
      expect(PupilFreezeService.applyThaw).toHaveBeenCalled()
    })

    test('handles unexpected errors by showing the form page again', async () => {
      // Careful here.  This call (getPupilDetailsByUrlSlug) is also used in the GET handler, which we want to succeed in this case.
      jest.spyOn(ServiceManagerPupilService, 'getPupilDetailsByUrlSlug').mockRejectedValueOnce(new Error('mock error'))
      const req = getReq(baseReq)
      const res = getRes()
      await controller.postPupilThaw(req, res, next)
      expect(controller.getPupilThaw).toHaveBeenCalled()
      const validationErrorArg = controller.getPupilThaw.mock.calls[0][3]
      expect(validationErrorArg.errors.upn).toBe('mock error')
    })
  })

  describe('getAttendanceCodes', () => {
    let baseReq
    beforeEach(() => {
      baseReq = {
        method: 'GET',
        url: '/service-manager/attendance-codes',
        query: {
          page: 1
        }
      }
      jest.spyOn(ServiceManagerAttendanceService, 'getAttendanceCodes').mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          pageCount: 1,
          perPage: 10,
          total: 1
        }
      })
    })

    test('it renders the attendance codes page', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      await controller.getAttendanceCodes(req, res, next)
      expect(res.render).toHaveBeenCalled()
      const args = res.render.mock.calls[0]
      expect(args[0]).toBe('service-manager/attendance-codes')
    })

    test('it handles an error by calling next', async () => {
      const req = getReq(baseReq)
      const res = getRes()
      jest.spyOn(ServiceManagerAttendanceService, 'getAttendanceCodes').mockRejectedValue(new Error('mock error from testing'))
      await controller.getAttendanceCodes(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('postUpdateAttendanceCodes', () => {
    test('it updates the attendance codes', async () => {
      const attendanceCodes = ['ABCDE', 'FGHIJ', 'KLMNO']
      const req = getReq({
        method: 'POST',
        url: '/service-manager/attendance-codes',
        body: {
          attendanceCodes
        }
      })
      const res = getRes()
      const serviceSpy = jest.spyOn(ServiceManagerAttendanceService, 'setVisibleAttendanceCodes').mockResolvedValue()
      await controller.postUpdateAttendanceCodes(req, res, next)
      expect(serviceSpy).toHaveBeenCalledWith(attendanceCodes)
    })
  })
})
