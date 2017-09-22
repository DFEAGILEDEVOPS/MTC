'use strict'
/* global describe, beforeEach, afterEach, it, expect */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const proxyquire = require('proxyquire').noCallThru()
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const checkFormMock = require('../mocks/checkform')
const Pupil = require('../../models/pupil')
const School = require('../../models/school')
const CheckForm = mongoose.model('Dummy', new Schema({name: {type: String}}))
const configService = require('../../services/config-service')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwtService = require('../../services/jwt.service')
require('sinon-mongoose')
let sandbox
let jwtPromiseHelper
let mockQuestionData
let goodReq

describe('questions controller', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    const jwtPromise = new Promise((resolve, reject) => {
      jwtPromiseHelper = {
        resolve,
        reject
      }
    })

    mockQuestionData = (hasPupil, hasSchool, hasCheckform) => {
      sandbox.mock(Pupil).expects('findOne').chain('exec').resolves(hasPupil && pupilMock)
      sandbox.mock(School).expects('findOne').chain('lean').chain('exec').resolves(hasSchool && schoolMock)
      sandbox.mock(CheckForm).expects('findOne').chain('lean').chain('exec').resolves(hasCheckform && checkFormMock)
      sandbox.mock(configService).expects('getConfig').resolves({questionTime: 6, loadingTime: 3})
      sandbox.stub(jwtService, 'createToken').returns(jwtPromise)

      const { getQuestions } = proxyquire('../../controllers/questions', {
        '../models/check-form': CheckForm,
        '../models/pupil': Pupil,
        '../models/school': School,
        '../services/config-service': configService,
        '../services/jwt-service': jwtService
      })
      return getQuestions
    }
    goodReq = httpMocks.createRequest({
      method: 'POST',
      url: '/api/questions',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupilPin: 'pin',
        schoolPin: 'pin'
      }
    })
  })
  afterEach(() => { sandbox.restore() })
  describe('access token generation succeeds', () => {
    beforeEach(() => {
      jwtPromiseHelper.resolve('fake-access-token')
    })

    it('throws an error if pupil pin and school pin are not provided', async(done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/questions',
        body: {}
      })
      const res = httpMocks.createResponse()
      const getQuestions = mockQuestionData(false, false, false)
      await getQuestions(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      done()
    })

    it('throws an authentication error if pupil or school details are not found', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const getQuestions = mockQuestionData(true, false, true)
      await getQuestions(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(401)
      expect(data.error).toBe('Unauthorised')
      done()
    })

    it('throws an authentication error if pupil or school details are not found', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const getQuestions = mockQuestionData(true, false, true)
      await getQuestions(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(401)
      expect(data.error).toBe('Unauthorised')
      done()
    })

    it('throws question set not found for pupil when checkform object is not found', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const getQuestions = mockQuestionData(true, true, false)
      await getQuestions(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      done()
    })

    it('returns a valid response', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const getQuestions = mockQuestionData(true, true, true)
      await getQuestions(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(200)
      expect(data.questions.length).toBe(20)
      expect(data.pupil.firstName).toBe('Pupil')
      expect(data.school.name).toBe('Example School One')
      expect(data.config.questionTime).toBe(6)
      done()
    })
  })

  describe('access token generation failure', () => {
    beforeEach(() => {
      jwtPromiseHelper.reject('access token error : technical')
    })
    it('sends a 500 error if the token generation fails', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const getQuestions = mockQuestionData(true, true, true)
      await getQuestions(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      done()
    })
  })
})
