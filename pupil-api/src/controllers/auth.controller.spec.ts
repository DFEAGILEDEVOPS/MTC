'use strict'

/* global describe spyOn */

import { AuthController } from './auth.controller'
import * as httpMocks from 'node-mocks-http'
import logger from '../services/log.service'
import { pupilAuthenticationService } from '../services/azure-pupil-auth.service'
import { IFeatureService } from '../services/feature.service'
import { IPupilAuthenticationService } from '../services/redis-pupil-auth.service'

const RedisPupilAuthServiceMock = jest.fn<IPupilAuthenticationService, any>(() => ({
  authenticate: jest.fn()
}))

const FeatureServiceMock = jest.fn<IFeatureService, any>(() => ({
  redisAuthMode: jest.fn()
}))

let req
let res
let mockResponse = {}
let mockErrorResponse = new Error('mock error')
let authController: AuthController
let featureService: IFeatureService
let redisPupilAuthService: IPupilAuthenticationService

describe('auth controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    req.body = { schoolPin: 'pin1', pupilPin: 'pin2' }
    res = httpMocks.createResponse()
    featureService = new FeatureServiceMock()
    redisPupilAuthService = new RedisPupilAuthServiceMock()
    authController = new AuthController(featureService)
  })

  it('returns an 400 error if the request is not JSON', async () => {
    req = createMockRequest('text/html')
    spyOn(logger, 'error')
    await authController.postAuth(req, res)
    expect(res.statusCode).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Bad request')
  })

  it('allows a content-type of application/json', async () => {
    spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.resolve(mockResponse))
    req = createMockRequest('application/json')
    req.body = {
      schoolPin: 'abc12def',
      pupilPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(res.statusCode).toBe(200)
  })

  it('allows a content-type of application/json with a charset', async () => {
    spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.resolve(mockResponse))
    req = createMockRequest('application/json; charset=utf-8')
    req.body = {
      schoolPin: 'abc12def',
      pupilPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(res.statusCode).toBe(200)
  })

  it('makes a call to the authentication service if redis not enabled', async () => {
    featureService.redisAuthMode = jest.fn(() => {
      return false
    })
    spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.resolve(mockResponse))
    req.body = { schoolPin: 'pin1', pupilPin: 'pin2' }
    await authController.postAuth(req, res)
    expect(pupilAuthenticationService.authenticate).toHaveBeenCalledWith('pin2', 'pin1')
  })

  it('returns unauthorised if the login failed', async () => {
    spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.reject(mockErrorResponse))
    spyOn(logger, 'error')
    await authController.postAuth(req, res)
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  it('shortcuts to return unauthorised if no schoolPin provided', async () => {
    spyOn(pupilAuthenticationService, 'authenticate')
    spyOn(logger, 'error')
    req.body = {
      pupilPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(pupilAuthenticationService.authenticate).not.toHaveBeenCalled()
    expect(redisPupilAuthService.authenticate).not.toHaveBeenCalled()
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  it('shortcuts to return unauthorised if no pupilPin provided', async () => {
    spyOn(pupilAuthenticationService, 'authenticate')
    spyOn(logger, 'error')
    req.body = {
      schoolPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(pupilAuthenticationService.authenticate).not.toHaveBeenCalled()
    expect(redisPupilAuthService.authenticate).not.toHaveBeenCalled()
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  it('returns a data packet to the client if authorisation is successful', async () => {
    spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.resolve(mockResponse))
    await authController.postAuth(req, res)
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(200)
    expect(data).toBeTruthy()
  })

  it('returns a 401 if no redis preparedCheck found', async () => {
    redisPupilAuthService.authenticate = jest.fn((schoolPin: string, pupilPin: string) => {
      return undefined
    })
    featureService.redisAuthMode = jest.fn(() => {
      return true
    })
    await authController.postAuth(req, res)
    expect(res.statusCode).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Unauthorised')
  })
})

function createMockRequest (contentType: String): any {
  return httpMocks.createRequest({
    method: 'POST',
    url: '/auth',
    headers: {
      'Content-Type': `${contentType}`,
      'Content-Length': '42' // needed to make `req.is` work
    }
  })
}
