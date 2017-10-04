'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise
const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const School = require('../../models/school')
const Pupil = require('../../models/pupil')
const pupilValidator = require('../../lib/validator/pupil-validator')
const ValidationError = require('../../lib/validation-error')

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

      xit('throws an error and calls next()', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalledWith(new Error(`School [${req.body.school}] not found`))
        done()
      })
    })
  })
})
