'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise
const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const config = require('../../config')
const School = require('../../models/school')
const Pupil = require('../../models/pupil')
const pupilValidator = require('../../lib/validator/pupil-validator')
const fileValidator = require('../../lib/validator/file-validator')
const pupilUploadService = require('../../services/pupil-upload.service')
const ValidationError = require('../../lib/validation-error')
const azureFileDataService = require('../../services/data-access/azure-file.data.service')
const dateService = require('../../services/date.service')
const generatePinsService = require('../../services/generate-pins.service')
const qrService = require('../../services/qr.service')

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
    return req
  }

  describe('getAddPupil() route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(new School({name: 'Test School'}))
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).getAddPupil
      })

      it('displays an add pupil page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).not.toHaveBeenCalled()
        done()
      })

      it('catches errors in the render() call', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.throwError('test')
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(null)
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).getAddPupil
      })

      it('it throws an error', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })

  describe('postAddPupil() route', () => {
    let controller
    let sandbox
    let next
    // Mock the pupil model
    class pupilMock {
      save () {}
      validate () {}
    }
    let goodReqParams = {
      method: 'POST',
      url: '/school/pupil/add',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(new School({name: 'Test School'}))
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School,
          '../models/pupil': pupilMock
        }).postAddPupil
      })

      it('saves the new pupil and redirects to the manage pupils page', async (done) => {
        spyOn(pupilMock.prototype, 'save')
        spyOn(pupilValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
        expect(pupilMock.prototype.save).toHaveBeenCalled()
        done()
      })

      it('it calls next if it can\'t save the pupil', async (done) => {
        spyOn(pupilMock.prototype, 'save').and.throwError()
        spyOn(pupilValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })

      it('it re-displays the add pupil page if the pupilValidator fails', async (done) => {
        spyOn(pupilMock.prototype, 'save')
        const validationError = new ValidationError()
        validationError.addError('test-field', 'test error message')
        spyOn(pupilValidator, 'validate').and.returnValue(Promise.resolve(validationError))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        done()
      })

      it('it re-displays the add pupil page if the mongoose validator fails', async (done) => {
        spyOn(pupilMock.prototype, 'save')
        const pupil = new Pupil({
          school: 9999999,
          upn: 'A999999999999',
          // Blank first name - will throw an error
          foreName: '',
          lastName: 'Pupil',
          gender: 'M',
          dob: ''
        })
        let mongooseError
        try {
          await pupil.validate()
        } catch (error) {
          mongooseError = error
        }
        // This is a little clumsy - using the mock to throw the real mongooseError
        spyOn(pupilMock.prototype, 'validate').and.throwError(mongooseError)
        // A blank error object
        spyOn(pupilValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        const res = getRes()
        const req = getReq(goodReqParams)
        req.body = {}
        req.body.foreName = ''
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        done()
      })
    })

    describe('when the school is NOT found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(null)
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).postAddPupil
      })

      it('throws an error and calls next()', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalledWith(new Error(`School [${req.body.school}] not found`))
        done()
      })
    })
  })

  describe('getAddMultiplePupils() route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add-batch-pupils',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil.js').getAddMultiplePupils
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('displays an add multiple pupil page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(next).not.toHaveBeenCalled()
      done()
    })

    it('catches errors in the render() call', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.throwError('test')
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(next).toHaveBeenCalled()
      done()
    })
  })

  describe('postAddMultiplePupils() route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
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
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(new School({ name: 'Test School' }))
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).postAddMultiplePupils
      })

      it('saves the new pupil and redirects to the register pupils page', async (done) => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise
          .resolve({ pupils: [ { id: 1 }, { id: 2 } ], pupilIds: [ '1', '2' ] }))
        const res = getRes()
        const req = getReq(goodReqParams)
        req.flash = () => {
        }
        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
        done()
      })

      it('redirects to the add multiple pupils page when file errors have been found', async (done) => {
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
        done()
      })

      it('calls next for any thrown errors within pupilUpload service', async (done) => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise.reject(new Error('error')))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        done()
      })

      it('calls next for any error that is returned from pupilUpload service', async (done) => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise
          .resolve({ error: 'error' }))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalledWith('error')
        done()
      })

      it('redirects to the add multiple pupils page when csv validation returns errors', async (done) => {
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
        done()
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(null)
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).postAddMultiplePupils
      })
      it('it throws an error', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })

  describe('getAddMultiplePupilsCSVTemplate route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/pupil/download-multiple-template',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil.js').getAddMultiplePupilsCSVTemplate
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('calls express response download', async (done) => {
      const res = getRes()
      res.download = () => {}
      spyOn(res, 'download').and.returnValue(null)
      const req = getReq(goodReqParams)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.download).toHaveBeenCalledWith('assets/csv/MTC-Pupil-details-template-Sheet-1.csv')
      done()
    })
  })

  describe('getErrorCSVFile route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/pupil/download-error-csv',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil.js').getErrorCSVFile
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('writes csv file to response and calls end to begin download', async (done) => {
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
      done()
    })
  })

  describe('getPrintPins route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/pupil/download-error-csv',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil.js').getPrintPins
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('returns data for the print page', async (done) => {
      spyOn(dateService, 'formatDayAndDate').and.returnValue('')
      spyOn(generatePinsService, 'getPupilsWithActivePins').and.returnValue([])
      spyOn(generatePinsService, 'getActiveSchool').and.returnValue({})
      spyOn(qrService, 'getDataURL').and.returnValue('')
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.returnValue(null)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalledWith('school/pin-print', {
        pupils: [],
        school: {},
        date: '',
        qrDataURL: '',
        url: config.PUPIL_APP_URL
      })
      done()
    })
  })
})
