'use strict'
/* global describe, beforeEach, afterEach, expect, it */
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwtService = require('../../services/jwt-service')
const { feedbackData } = require('../mocks/pupil-feedback')

require('sinon-mongoose')
const validToken = 'good_token'
let sandbox
let jwtPromiseHelper
let mockCheckData
let goodReq
let PupilFeedback
let isSuccessful

describe('Pupil Feedback controller', () => {
  const getResult = (isSuccessful) => {
    if (isSuccessful) return isSuccessful
    throw new Error('saving error')
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

    mockCheckData = async() => {
      sandbox.stub(jwtService, 'verify').returns(jwtPromise)
      const {postCheck} = proxyquire('../../controllers/pupil-feedback', {
        '../services/jwt-service': jwtService,
        '../models/pupil-feedback': PupilFeedback
      })
      return postCheck
    }

    goodReq = httpMocks.createRequest({
      method: 'POST',
      url: '/api/pupil-feedback',
      body: {feedbackData, validToken}
    })
  })

  afterEach(() => { sandbox.restore() })

  describe('when accessing token validation', () => {
    beforeEach(() => {
      isSuccessful = true
      jwtPromiseHelper.resolve(true)
    })

    it('returns bad request if request payload is not provided', async(done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/pupil-feedback',
        body: {}
      })
      const res = httpMocks.createResponse()
      const postCheck = await mockCheckData()
      await postCheck(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad Request')
      done()
    })
  })
})
