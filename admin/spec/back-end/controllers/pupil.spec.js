'use strict'
/* global describe beforeEach it expect jasmine spyOn */

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
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991999 }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('getAddPupil() route', () => {
    let controller
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        controller = require('../../../controllers/pupil.js').getAddPupil
      })

      it('displays an add pupil page', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfSubmitted: false })
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).not.toHaveBeenCalled()
      })

      it('catches errors in the render() call', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfSubmitted: false })
        spyOn(res, 'render').and.throwError('test')
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })
    })
  })

  describe('#postAddPupil route', () => {
    let controller, nextSpy, next, req, res
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
      nextSpy = jasmine.createSpy('next')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfSubmitted: false })
    })

    describe('the pupilData is saved', () => {
      beforeEach(() => {
        spyOn(pupilAddService, 'addPupil').and.returnValue(pupilMock)
        controller = require('../../../controllers/pupil').postAddPupil
      })

      it('calls pupilAddService to add a new pupil to the database', async () => {
        await controller(req, res, nextSpy)
        expect(pupilAddService.addPupil).toHaveBeenCalledTimes(1)
      })

      it('redirects to the pupil register page', async () => {
        await controller(req, res, nextSpy)
        expect(res.statusCode).toBe(302)
      })
      it('calls pupilRegisterCachingService.dropPupilRegisterCache if pupil has been successfully added', async () => {
        await controller(req, res, nextSpy)
      })
    })

    describe('the pupilData is not saved', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        validationError.addError('upn', 'Mock error')
        next = jasmine.createSpy('next')
        spyOn(pupilAddService, 'addPupil').and.throwError(validationError)
        controller = require('../../../controllers/pupil')
      })

      it('then it shows the page again', async () => {
        spyOn(pupilController, 'getAddPupil').and.callFake((req, res) => {
          res.end('mock doc')
          return Promise.resolve()
        })
        await pupilController.postAddPupil(req, res, nextSpy)
        expect(pupilAddService.addPupil).toHaveBeenCalledTimes(1)
        expect(next).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
      })
    })
  })

  describe('getAddMultiplePupils() route', () => {
    let controller
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add-batch-pupils',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
      controller = require('../../../controllers/pupil.js').getAddMultiplePupils
    })

    it('displays an add multiple pupil page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(uploadedFileService, 'getFilesize')
      spyOn(uploadedFileService, 'getAzureBlobFileSize')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfSubmitted: false })
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(uploadedFileService.getFilesize).toHaveBeenCalled()
      expect(uploadedFileService.getAzureBlobFileSize).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('catches errors in the render() call', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(uploadedFileService, 'getFilesize')
      spyOn(uploadedFileService, 'getAzureBlobFileSize')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfSubmitted: false })
      spyOn(res, 'render').and.throwError('test')
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(uploadedFileService.getFilesize).toHaveBeenCalled()
      expect(uploadedFileService.getAzureBlobFileSize).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('postAddMultiplePupils() route', () => {
    let controller
    let next
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
      next = jasmine.createSpy('next')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ hdfSubmitted: false })
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        spyOn(schoolService, 'findOneById').and.returnValue(schoolMock)
        controller = require('../../../controllers/pupil').postAddMultiplePupils
      })

      it('saves the new pupil and redirects to the register pupils page', async () => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise
          .resolve({ pupilIds: ['1', '2'] }))
        spyOn(pupilDataService, 'sqlFindByIds').and.returnValue(Promise.resolve([pupilMock]))
        const res = getRes()
        const req = getReq(goodReqParams)
        req.flash = () => {}
        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
      })

      it('drops pupil register cache after a save', async () => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise
          .resolve({ pupilIds: ['1', '2'] }))
        spyOn(pupilDataService, 'sqlFindByIds').and.returnValue(Promise.resolve([pupilMock]))
        const res = getRes()
        const req = getReq(goodReqParams)
        req.flash = () => {}
        await controller(req, res, next)
      })

      it('displays the add multiple pupils page when file errors have been found', async () => {
        const validationError = new ValidationError()
        validationError.addError('test-field', 'test error message')
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(validationError))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.fileErrors.get('test-field')).toBe('test error message')
        expect(res.locals).toBeDefined()
        expect(res.locals.pageTitle).toBe('Add multiple pupils')
      })

      it('calls next for any thrown errors within pupilUpload service', async () => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise.reject(new Error('error')))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })

      it('calls next for any error that is returned from pupilUpload service', async () => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise
          .resolve({ error: 'error' }))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalledWith('error')
      })

      it('displays the add multiple pupils page when csv validation returns errors', async () => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise.resolve({
          csvErrorFile: 'test.csv',
          hasValidationError: true
        }))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(req.session.csvErrorFile).toBe('test.csv')
        expect(res.locals).toBeDefined()
        expect(res.locals.pageTitle).toBe('Add multiple pupils')
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        spyOn(schoolService, 'findOneById').and.returnValue(undefined)
        controller = require('../../../controllers/pupil').postAddMultiplePupils
      })
      it('it throws an error', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
      })
    })
  })

  describe('getErrorCSVFile route', () => {
    let controller
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/pupil/download-error-csv',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
      controller = require('../../../controllers/pupil.js').getErrorCSVFile
    })

    it('writes csv file to response and calls end to begin download', async () => {
      spyOn(azureFileDataService, 'azureDownloadFile').and.returnValue(Promise.resolve('text'))
      const res = getRes()
      res.write = () => {}
      res.end = () => {}
      spyOn(res, 'write').and.returnValue(null)
      spyOn(res, 'end').and.returnValue(null)
      const req = getReq(goodReqParams)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.write).toHaveBeenCalledWith('text')
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('#getEditPupilById', () => {
    let controller, next
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
      controller = require('../../../controllers/pupil.js').getEditPupilById
      next = jasmine.createSpy('next')
    })

    it('retrieves the pupil data', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').and.returnValue(Promise.resolve(populatedPupilMock))
      await controller(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
    })

    it('bails out if the pupil is not found', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').and.returnValue(Promise.resolve(null))
      await controller(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error(`Pupil ${req.params.id} not found`))
    })

    it('bails out if any of the method raises an exception', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').and.callFake(() => { throw new Error('dummy error') })
      controller(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('dummy error'))
    })
  })

  describe('postEditPupil', () => {
    let controller, next
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

    beforeEach(() => {
      controller = require('../../../controllers/pupil.js').postEditPupil
      next = jasmine.createSpy('next')
    })

    it('makes a call to retrieve the pupil', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').and.returnValue(Promise.resolve(pupilMock))
      spyOn(schoolService, 'findOneById').and.returnValue(Promise.resolve(schoolMock))
      // As we do not want to run any more of the controller code than we need to we can trigger an
      // exception to bail out early, which saves mocking the remaining calls.
      spyOn(pupilValidator, 'validate').and.callFake(() => { throw new Error('unit test early exit') })
      await controller(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
    })

    it('bails out if the pupil if not found', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').and.returnValue(Promise.resolve(null))
      await controller(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error(`Pupil ${req.body.urlSlug} not found`))
    })

    it('makes a call to retrieve the school', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').and.returnValue(Promise.resolve(pupilMock))
      spyOn(schoolService, 'findOneById').and.returnValue(Promise.resolve(schoolMock))
      // As we do not want to run any more of the controller code than we need to we can trigger an
      // exception to bail out early, which saves mocking the remaining calls.
      spyOn(pupilValidator, 'validate').and.callFake(() => { throw new Error('unit test early exit') })
      await controller(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
      expect(schoolService.findOneById).toHaveBeenCalledWith(pupilMock.school_id)
    })
    it('calls pupilRegisterCachingService.dropPupilRegisterCache if pupil has been successfully edited', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(pupilDataService, 'sqlFindOneBySlugWithAgeReason').and.returnValue(Promise.resolve(pupilMock))
      spyOn(schoolService, 'findOneById').and.returnValue(Promise.resolve(schoolMock))
      spyOn(pupilValidator, 'validate').and.returnValue(new ValidationError())
      spyOn(pupilEditService, 'update')
      spyOn(res, 'render')
      // As we do not want to run any more of the controller code than we need to we can trigger an
      // exception to bail out early, which saves mocking the remaining calls.
      await controller(req, res, next)
      expect(pupilDataService.sqlFindOneBySlugWithAgeReason).toHaveBeenCalled()
      expect(schoolService.findOneById).toHaveBeenCalledWith(pupilMock.school_id)
      expect(pupilEditService.update).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
    // TODO - this method requires further coverage
  })
})
