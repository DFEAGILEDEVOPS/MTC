'use strict'
/* global describe, beforeEach, afterEach, expect, it */
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwtService = require('../../services/jwt.service')
const { feedbackData } = require('../mocks/pupil-feedback')
const checkDataService = require('../../services/data-access/check.data.service')
const pupilFeedbackDataService = require('../../services/data-access/pupil-feedback.data.service')
const checkMock = require('../mocks/check')

let sandbox
let jwtPromiseHelper
let mockCheckData
let findOneByCheckCodePromiseHelper
let pupilFeedbackCreateStub

const resolve = () => Promise.resolve(feedbackData)
const reject = () => Promise.reject(new Error('pupil feedback mock error'))

describe('Pupil Feedback controller', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create()

    const jwtPromise = new Promise((resolve, reject) => {
      jwtPromiseHelper = {
        resolve,
        reject
      }
    })

    const findOneByCheckCodePromise = new Promise((resolve, reject) => {
      findOneByCheckCodePromiseHelper = {
        resolve,
        reject
      }
    })

    mockCheckData = async (options) => {
      sandbox.stub(jwtService, 'verify').returns(jwtPromise)
      sandbox.stub(checkDataService, 'sqlFindOneByCheckCode').returns(findOneByCheckCodePromise)
      pupilFeedbackCreateStub = sandbox.stub(pupilFeedbackDataService, 'sqlCreate')
        .callsFake((options && options.create) || resolve)
      const { setPupilFeedback } = proxyquire('../../controllers/pupil-feedback', {
        '../services/jwt-service': jwtService,
        '../services/data-access/check.data.service': checkDataService,
        '../services/data-access/pupil-feedback.data.service': pupilFeedbackDataService
      })
      return setPupilFeedback
    }
  })

  afterEach(() => { sandbox.restore() })

  describe('when accessing token validation', () => {
    beforeEach(() => {
      jwtPromiseHelper.resolve(true)
      findOneByCheckCodePromiseHelper.resolve(checkMock)
    })

    it('returns bad request if request payload is not provided', async (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/pupil-feedback',
        body: {}
      })
      const res = httpMocks.createResponse()
      const setPupilFeedback = await mockCheckData()
      await setPupilFeedback(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      done()
    })

    it('returns a successful response when validation passes', async (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/pupil-feedback',
        body: feedbackData
      })
      const res = httpMocks.createResponse()
      const setPupilFeedback = await mockCheckData()
      await setPupilFeedback(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(201)
      expect(data).toBe('Pupil feedback saved')
      done()
    })

    it('saves the data', async (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/pupil-feedback',
        body: feedbackData
      })
      const res = httpMocks.createResponse()
      const setPupilFeedback = await mockCheckData()
      await setPupilFeedback(req, res)
      expect(pupilFeedbackCreateStub.callCount).toBe(1)
      done()
    })
  })

  describe('when access token validation fails', () => {
    beforeEach(() => {
      jwtPromiseHelper.reject('access token error : technical')
    })

    it('sends a 401 error', async (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/pupil-feedback',
        body: feedbackData
      })
      const res = httpMocks.createResponse()
      const setPupilFeedback = await mockCheckData()
      await setPupilFeedback(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(401)
      expect(data.error).toBe('Unauthorised')
      done()
    })
  })

  describe('when setPupilFeedback fails', () => {
    beforeEach(() => {
      jwtPromiseHelper.resolve(true)
      findOneByCheckCodePromiseHelper.resolve(checkMock)
    })

    it('returns a server error', async (done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/pupil-feedback',
        body: feedbackData
      })
      const res = httpMocks.createResponse()
      const postCheck = await mockCheckData({create: reject})
      await postCheck(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      done()
    })
  })

  describe('checkDataService error path', () => {
    let req, res
    beforeEach(() => {
      jwtPromiseHelper.resolve(true)
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/pupil-feedback',
        body: feedbackData
      })
      res = httpMocks.createResponse()
    })

    it('returns a bad request when the checkCode is not found', async (done) => {
      findOneByCheckCodePromiseHelper.resolve(null)
      const setPupilFeedback = await mockCheckData()
      await setPupilFeedback(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      done()
    })

    it('returns server error if the checkCodeDataService throws an error', async (done) => {
      findOneByCheckCodePromiseHelper.reject(new Error('mock'))
      const setPupilFeedback = await mockCheckData()
      await setPupilFeedback(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      done()
    })
  })
})
