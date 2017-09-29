'use strict'
/* global describe, beforeEach, afterEach, expect, it */
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const jwtService = require('../../services/jwt.service')
const {audit, inputs, answers} = require('../mocks/check-complete')

require('sinon-mongoose')
const validToken = 'good_token'
let sandbox
let jwtPromiseHelper
let mockCheckData
let goodReq
let CompletedCheck
let isSuccessful

describe('completed check controller', () => {
  const getResult = (isSuccessful) => {
    if (isSuccessful) return isSuccessful
    throw new Error('saving error')
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    CompletedCheck = class CompletedChecks {
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
      const {postCheck} = proxyquire('../../controllers/completed-check', {
        '../services/jwt-service': jwtService,
        '../models/completed-checks': CompletedCheck
      })
      return postCheck
    }

    goodReq = httpMocks.createRequest({
      method: 'POST',
      url: '/api/completed-check',
      body: {audit, inputs, answers, validToken}
    })
  })
  afterEach(() => { sandbox.restore() })
  describe('when access token validation succeeds', () => {
    beforeEach(() => {
      isSuccessful = true
      jwtPromiseHelper.resolve(true)
    })

    it('returns bad request if request payload is not provided', async(done) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/completed-check',
        body: {}
      })
      const res = httpMocks.createResponse()
      const postCheck = await mockCheckData()
      await postCheck(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      done()
    })

    it('returns created if payload is provided', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const postCheck = await mockCheckData()
      await postCheck(req, res)
      expect(res.statusCode).toBe(201)
      done()
    })
  })

  describe('when access token validation fails', () => {
    beforeEach(() => {
      jwtPromiseHelper.reject('access token error : technical')
    })
    it('sends a 401 error', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const postCheck = await mockCheckData()
      await postCheck(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(401)
      expect(data.error).toBe('Unauthorised')
      done()
    })
  })

  describe('when saving completed check fails', () => {
    beforeEach(() => {
      isSuccessful = false
      jwtPromiseHelper.resolve(true)
    })
    it('returns server error', async (done) => {
      const req = goodReq
      const res = httpMocks.createResponse()
      const postCheck = await mockCheckData()
      await postCheck(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      done()
    })
  })
})
