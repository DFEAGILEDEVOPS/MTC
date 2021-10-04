'use strict'
/* global describe beforeEach test expect jest afterEach */

const httpMocks = require('node-mocks-http')
const R = require('ramda')

const azureFileDataService = require('../../../services/data-access/azure-file.data.service')
const fileValidator = require('../../../lib/validator/file-validator')
const pupilAddService = require('../../../services/pupil-add-service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilMock = require('../mocks/pupil')
const pupilUploadService = require('../../../services/pupil-upload.service')
const pupilValidator = require('../../../lib/validator/pupil-validator')
const schoolService = require('../../../services/school.service')
const schoolMock = require('../mocks/school')
const uploadedFileService = require('../../../services/uploaded-file.service')
const businessAvailabilityService = require('../../../services/business-availability.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const pupilEditService = require('../../../services/pupil-edit.service')
const ValidationError = require('../../../lib/validation-error')
const pupilController = require('../../../controllers/pupil')

describe('pupil controller:', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991999 }
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

  describe('getAddPupil() route', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    describe('when the school is found in the database', () => {
      test('displays an add pupil page', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
        await pupilController.getAddPupil(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).not.toHaveBeenCalled()
      })

      test('catches errors in the render() call', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
        jest.spyOn(res, 'render').mockImplementation(() => {
          throw new Error('test')
        })
        await pupilController.getAddPupil(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })
    })
  })

  describe('#postAddPupil route', () => {
    let req, res
    const goodReqParams = {
      method: 'POST',
      url: '/school/pupil/add',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      res = getRes()
      req = getReq(goodReqParams)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
    })

    describe('the pupilData is saved', () => {
      beforeEach(() => {
        jest.spyOn(pupilAddService, 'addPupil').mockResolvedValue(pupilMock)
      })

      test('calls pupilAddService to add a new pupil to the database', async () => {
        await pupilController.postAddPupil(req, res, next)
        expect(pupilAddService.addPupil).toHaveBeenCalledTimes(1)
      })

      test('redirects to the pupil register page', async () => {
        await pupilController.postAddPupil(req, res, next)
        expect(res.statusCode).toBe(302)
      })
    })

    describe('the pupilData is not saved', () => {
      beforeEach(() => {
        jest.spyOn(pupilAddService, 'addPupil').mockImplementation(() => {
          const validationError = new ValidationError()
          validationError.addError('upn', 'Mock error')
          throw validationError
        })
      })

      test('then it shows the page again', async () => {
        jest.spyOn(pupilController, 'getAddPupil').mockImplementation((req, res) => {
          res.end('mock doc')
          return Promise.resolve()
        })
        await pupilController.postAddPupil(req, res, next)
        expect(pupilAddService.addPupil).toHaveBeenCalledTimes(1)
        expect(next).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
      })
    })
  })

  describe('getAddMultiplePupils() route', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add-batch-pupils',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    test('displays an add multiple pupil page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(uploadedFileService, 'getFilesize').mockImplementation()
      jest.spyOn(uploadedFileService, 'getAzureBlobFileSize').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
      await pupilController.getAddMultiplePupils(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(uploadedFileService.getFilesize).toHaveBeenCalled()
      expect(uploadedFileService.getAzureBlobFileSize).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('catches errors in the render() call', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(uploadedFileService, 'getFilesize').mockImplementation()
      jest.spyOn(uploadedFileService, 'getAzureBlobFileSize').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
      jest.spyOn(res, 'render').mockImplementation(() => {
        throw new Error('test')
      })
      await pupilController.getAddMultiplePupils(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(uploadedFileService.getFilesize).toHaveBeenCalled()
      expect(uploadedFileService.getAzureBlobFileSize).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('postAddMultiplePupils() route', () => {
    const goodReqParams = {
      method: 'POST',
      url: '/school/pupil/add-batch-pupils',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      files: {
        csvTemplate: {
          name: 'name'
        }
      }
    }
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      })

      test('saves the new pupil and redirects to the register pupils page', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(new ValidationError())
        jest.spyOn(pupilUploadService, 'upload').mockResolvedValue({ pupilIds: ['1', '2'] })
        jest.spyOn(pupilDataService, 'sqlFindByIds').mockResolvedValue([pupilMock])
        const res = getRes()
        const req = getReq(goodReqParams)
        req.flash = () => {}
        await pupilController.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(302)
      })

      test('displays the add multiple pupils page when file errors have been found', async () => {
        const validationError = new ValidationError()
        validationError.addError('test-field', 'test error message')
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(validationError)
        const res = getRes()
        const req = getReq(goodReqParams)
        await pupilController.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.fileErrors.get('test-field')).toBe('test error message')
        expect(res.locals).toBeDefined()
        expect(res.locals.pageTitle).toBe('Add multiple pupils')
      })

      test('calls next for any thrown errors within pupilUpload service', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(new ValidationError())
        jest.spyOn(pupilUploadService, 'upload').mockRejectedValue(new Error('error'))
        const res = getRes()
        const req = getReq(goodReqParams)
        await pupilController.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })

      test('calls next for any error that is returned from pupilUpload service', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(new ValidationError())
        jest.spyOn(pupilUploadService, 'upload').mockResolvedValue({ error: 'error' })
        const res = getRes()
        const req = getReq(goodReqParams)
        await pupilController.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalledWith('error')
      })

      test('displays the add multiple pupils page when csv validation returns errors', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(new ValidationError())
        jest.spyOn(pupilUploadService, 'upload').mockResolvedValue({
          csvErrorFile: 'test.csv',
          hasValidationError: true
        })
        const res = getRes()
        const req = getReq(goodReqParams)
        await pupilController.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(req.session.csvErrorFile).toBe('test.csv')
        expect(res.locals).toBeDefined()
        expect(res.locals.pageTitle).toBe('Add multiple pupils')
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        jest.spyOn(schoolService, 'findOneById').mockResolvedValue(undefined)
      })

      test('it throws an error', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await pupilController.postAddMultiplePupils(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
      })
    })
  })

  describe('getErrorCSVFile route', () => {
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/pupil/download-error-csv',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      next = jest.fn()
    })

    test('writes csv file to response and calls end to begin download', async () => {
      jest.spyOn(azureFileDataService, 'azureDownloadFile').mockResolvedValue('text')
      const res = getRes()
      jest.spyOn(res, 'write').mockReturnValue(null)
      jest.spyOn(res, 'end').mockReturnValue(null)
      const req = getReq(goodReqParams)
      await pupilController.getErrorCSVFile(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.write).toHaveBeenCalledWith('text')
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('#getEditPupilById', () => {
    let next
    const populatedPupilMock = R.assoc('school', schoolMock, pupilMock)
    const goodReqParams = {
      method: 'GET',
      url: '/school/pupil/edit/pupil1234',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      params: {
        id: 'pupil999'
      },
      user: {
        schoolId: 42
      }
    }

    beforeEach(() => {
      next = jest.fn()
    })

    test('retrieves the pupil data', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').mockResolvedValue(populatedPupilMock)
      await pupilController.getEditPupilById(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
    })

    test('bails out if the pupil is not found', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').mockReturnValue(null)
      await pupilController.getEditPupilById(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error(`Pupil ${req.params.id} not found`))
    })

    test('bails out if any of the method raises an exception', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').mockImplementation(() => {
        throw new Error('dummy error')
      })
      pupilController.getEditPupilById(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('dummy error'))
    })
  })

  describe('postEditPupil', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/school/pupil/edit/pupil1234',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        slug: 'pupil998'
      }
    }

    test('makes a call to retrieve the pupil', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      // As we do not want to run any more of the controller code than we need to we can trigger an
      // exception to bail out early, which saves mocking the remaining calls.
      jest.spyOn(pupilValidator, 'validate').mockImplementation(() => { throw new Error('unit test early exit') })
      await pupilController.postEditPupil(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
    })

    test('bails out if the pupil if not found', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').mockResolvedValue(null)
      await pupilController.postEditPupil(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error(`Pupil ${req.body.urlSlug} not found`))
    })

    test('makes a call to retrieve the school', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      // As we do not want to run any more of the controller code than we need to we can trigger an
      // exception to bail out early, which saves mocking the remaining calls.
      jest.spyOn(pupilValidator, 'validate').mockImplementation(() => { throw new Error('unit test early exit') })
      await pupilController.postEditPupil(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
      expect(schoolService.findOneById).toHaveBeenCalledWith(pupilMock.school_id)
    })

    test('calls pupilRegisterCachingService.dropPupilRegisterCache if pupil has been successfully edited', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      jest.spyOn(pupilValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(pupilEditService, 'update').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      // As we do not want to run any more of the controller code than we need to we can trigger an
      // exception to bail out early, which saves mocking the remaining calls.
      await pupilController.postEditPupil(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
      expect(schoolService.findOneById).toHaveBeenCalledWith(pupilMock.school_id)
      expect(pupilEditService.update).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
  })
})
