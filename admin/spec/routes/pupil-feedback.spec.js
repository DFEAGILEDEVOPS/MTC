'use strict'
/* global describe, beforeEach, afterEach, expect, it */
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwtService = require('../../services/jwt.service')
const { feedbackData } = require('../mocks/pupil-feedback')
const checkDataService = require('../../services/data-access/check.data.service')
const checkMock = require('../mocks/check')

require('sinon-mongoose')
let sandbox
let jwtPromiseHelper
let mockCheckData
let PupilFeedback
let isSuccessful
let findOneByCheckCodePromiseHelper

describe('Pupil Feedback controller', () => {
  const getResult = (isSuccessful) => {
    if (isSuccessful) {
      return isSuccessful
    } else {
      throw new Error('saving error')
    }
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    PupilFeedback = class PupilFeedbacks {
      save () { return getResult(isSuccessful) }
    }

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

    mockCheckData = async() => {
      sandbox.stub(jwtService, 'verify').returns(jwtPromise)
      sandbox.stub(checkDataService, 'findOneByCheckCode').returns(findOneByCheckCodePromise)
      const { setPupilFeedback } = proxyquire('../../controllers/pupil-feedback', {
        '../services/jwt-service': jwtService,
        '../models/pupil-feedback': PupilFeedback,
        '../services/data-access/check.data.service': checkDataService
      })
      return setPupilFeedback
    }
  })

  afterEach(() => { sandbox.restore() })

  describe('when accessing token validation', () => {
    beforeEach(() => {
      isSuccessful = true
      jwtPromiseHelper.resolve(true)
      findOneByCheckCodePromiseHelper.resolve(checkMock)
    })

    it('returns bad request if request payload is not provided', async(done) => {
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

    it('returns a successful response when validation passes', async(done) => {
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
      isSuccessful = false
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
      const postCheck = await mockCheckData()
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
      isSuccessful = true
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

    it('returns server error if the checkCodeDatasService throws an error', async (done) => {
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
