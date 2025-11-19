'use strict'

const httpMocks = require('node-mocks-http')
const R = require('ramda')

const fileValidator = require('../../../lib/validator/file-validator')
const pupilAddService = require('../../../services/pupil-add-service')
const pupilService = require('../../../services/pupil.service')
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
const sut = require('../../../controllers/pupil')
const csvService = require('../../../services/csv-file.service')
const { PupilHistoryService } = require('../../../services/pupil-history/pupil-history-service')

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
        await sut.getAddPupil(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).not.toHaveBeenCalled()
      })

      test('catches errors in the render() call', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ hdfSubmitted: false })
        jest.spyOn(res, 'render').mockImplementation(() => { throw new Error('test') })
        await sut.getAddPupil(req, res, next)
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

    describe('postAddPupil - the pupilData is saved', () => {
      beforeEach(() => {
        jest.spyOn(pupilAddService, 'addPupil').mockResolvedValue(pupilMock)
      })

      test('calls pupilAddService to add a new pupil to the database', async () => {
        await sut.postAddPupil(req, res, next)
        expect(pupilAddService.addPupil).toHaveBeenCalledTimes(1)
      })

      test('redirects to the pupil register page', async () => {
        await sut.postAddPupil(req, res, next)
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
        jest.spyOn(sut, 'getAddPupil').mockImplementation((req, res) => {
          res.end('mock doc')
          return Promise.resolve()
        })
        await sut.postAddPupil(req, res, next)
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
      await sut.getAddMultiplePupils(req, res, next)
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
      await sut.getAddMultiplePupils(req, res, next)
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
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(Promise.resolve(new ValidationError()))
        jest.spyOn(pupilUploadService, 'upload').mockResolvedValue({ pupilIds: ['1', '2'] })
        jest.spyOn(pupilService, 'fetchMultipleByIds').mockResolvedValue([pupilMock])
        const res = getRes()
        const req = getReq(goodReqParams)
        req.flash = () => {}
        await sut.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(302)
      })

      test('displays the add multiple pupils page when file errors have been found', async () => {
        const validationError = new ValidationError()
        validationError.addError('test-field', 'test error message')
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(validationError)
        const res = getRes()
        const req = getReq(goodReqParams)
        await sut.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.fileErrors.get('test-field')).toBe('test error message')
        expect(res.locals).toBeDefined()
        expect(res.locals.pageTitle).toBe('Add multiple pupils')
      })

      test('calls next for any thrown errors within pupilUpload service', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(Promise.resolve(new ValidationError()))
        jest.spyOn(pupilUploadService, 'upload').mockRejectedValue(new Error('error'))
        const res = getRes()
        const req = getReq(goodReqParams)
        await sut.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })

      test('calls next for any error that is returned from pupilUpload service', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(new ValidationError())
        jest.spyOn(pupilUploadService, 'upload').mockRejectedValue(new Error('error'))
        const res = getRes()
        const req = getReq(goodReqParams)
        await sut.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
      })

      test('calls next for an object indicating error that is returned from pupilUpload service', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(new ValidationError())
        jest.spyOn(pupilUploadService, 'upload').mockResolvedValue({ error: 'error' })
        const res = getRes()
        const req = getReq(goodReqParams)
        await sut.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalledWith('error')
      })

      test('displays the add multiple pupils page when csv validation returns errors', async () => {
        jest.spyOn(fileValidator, 'validate').mockResolvedValue(new ValidationError())
        jest.spyOn(pupilUploadService, 'upload').mockResolvedValue({
          csvErrorFile: 'test.csv',
          hasValidationError: true
        })
        jest.spyOn(sut, 'getAddMultiplePupils').mockImplementation()
        const res = getRes()
        const req = getReq(goodReqParams)
        await sut.postAddMultiplePupils(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(req.session.csvErrorFile).toBe('test.csv')
        expect(res.locals).toBeDefined()
        expect(sut.getAddMultiplePupils).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        jest.spyOn(schoolService, 'findOneById').mockResolvedValue(undefined)
      })

      test('it throws an error', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await sut.postAddMultiplePupils(req, res, next)
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
      const csvBuffer = Buffer.from('text')
      jest.spyOn(csvService, 'getCsvFileAsBuffer').mockResolvedValue(csvBuffer)
      const res = getRes()
      res.write = () => {}
      res.end = () => {}
      jest.spyOn(res, 'write').mockReturnValue(null)
      jest.spyOn(res, 'end').mockReturnValue(null)
      const req = getReq(goodReqParams)
      await sut.getErrorCSVFile(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.write).toHaveBeenCalledWith(csvBuffer)
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
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue(populatedPupilMock)
      await sut.getEditPupilById(req, res, next)
      expect(pupilService.fetchOnePupilBySlug).toHaveBeenCalled()
    })

    test('bails out if the pupil is not found', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockReturnValue(null)
      await sut.getEditPupilById(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error(`Pupil ${req.params.id} not found`))
    })

    test('bails out if any of the method raises an exception', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockImplementation(() => {
        throw new Error('dummy error')
      })
      sut.getEditPupilById(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('dummy error'))
    })
  })

  // eslint-disable-next-line jest/no-identical-title
  describe('postEditPupil', () => {
    const goodReqParams = {
      method: 'POST',
      url: '/school/pupil/edit/pupil1234',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        urlSlug: 'pupil998'
      },
      user: {
        schoolId: 42,
        id: 1
      }
    }

    let req, res, next

    beforeEach(() => {
      req = getReq(goodReqParams)
      res = getRes()
      next = jest.fn()
    })

    test('renders error page if pupil is not found', async () => {
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue(null)

      await sut.postEditPupil(req, res, next)

      expect(next).toHaveBeenCalledWith(new Error('Pupil pupil998 not found'))
    })

    test('renders error page if school is not found', async () => {
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(null)

      await sut.postEditPupil(req, res, next)

      expect(next).toHaveBeenCalledWith(new Error('School not found'))
    })

    test('renders error page if checkComplete is true', async () => {
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      jest.spyOn(pupilDataService, 'sqlFindCheckCompleteAndAttendance').mockResolvedValue({ checkComplete: true })

      await sut.postEditPupil(req, res, next)

      expect(next).toHaveBeenCalledWith(new Error('Pupil data cannot be edited as their check is complete'))
    })

    test('renders form with validation errors if validation fails', async () => {
      const validationError = new ValidationError()
      validationError.addError('field', 'error message')
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      jest.spyOn(pupilDataService, 'sqlFindCheckCompleteAndAttendance').mockResolvedValue({ checkComplete: false })
      jest.spyOn(pupilValidator, 'validate').mockResolvedValue(validationError)
      jest.spyOn(res, 'render').mockImplementation()

      await sut.postEditPupil(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pupil-register/edit-pupil', expect.objectContaining({
        error: validationError
      }))
    })

    test('updates pupil and redirects to pupil list on success', async () => {
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      jest.spyOn(pupilDataService, 'sqlFindCheckCompleteAndAttendance').mockResolvedValue({ checkComplete: false })
      jest.spyOn(pupilValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(pupilEditService, 'update').mockResolvedValue()
      jest.spyOn(res, 'render').mockImplementation()

      await sut.postEditPupil(req, res, next)

      expect(pupilEditService.update).toHaveBeenCalledWith(pupilMock, req.body, req.user.schoolId, req.user.id)
      expect(res.render).toHaveBeenCalledWith('redirect-delay.ejs', expect.objectContaining({
        redirectMessage: 'Saving changes...'
      }))
    })

    test('calls next with error if update fails', async () => {
      jest.spyOn(pupilService, 'fetchOnePupilBySlug').mockResolvedValue(pupilMock)
      jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
      jest.spyOn(pupilDataService, 'sqlFindCheckCompleteAndAttendance').mockResolvedValue({ checkComplete: false })
      jest.spyOn(pupilValidator, 'validate').mockResolvedValue(new ValidationError())
      jest.spyOn(pupilEditService, 'update').mockRejectedValue(new Error('Update failed'))

      await sut.postEditPupil(req, res, next)

      expect(next).toHaveBeenCalledWith(new Error('Update failed'))
    })
  })

  describe('getViewPupilHistory', () => {
    const goodReqParams = {
      method: 'GET',
      url: '/pupil-register/history/9f358669-0946-49b2-a1a2-1b966e0e815a',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      params: {
        urlSlug: '9f358669-0946-49b2-a1a2-1b966e0e815a'
      }
    }
    test('it calls the getHistory service and renders the result', async () => {
      const mockHistory = {
        school: {},
        pupils: [],
        restarts: [],
        checks: [],
        meta: {}
      }
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(PupilHistoryService, 'getHistory').mockResolvedValue(mockHistory)
      await sut.getViewPupilHistory(req, res, next)
      expect(PupilHistoryService.getHistory).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    test('it calls next() if an error is thrown in the controller', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(PupilHistoryService, 'getHistory').mockRejectedValue(new Error('mock error'))
      await sut.getViewPupilHistory(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
