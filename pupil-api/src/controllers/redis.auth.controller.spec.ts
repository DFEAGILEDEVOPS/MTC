'use strict'

import { RedisAuthController } from './redis.auth.controller'
import * as httpMocks from 'node-mocks-http'
import logger from '../services/log.service'
import { IPupilAuthenticationService } from '../services/redis-pupil-auth.service'

const RedisPupilAuthServiceMock = jest.fn<IPupilAuthenticationService, any>(() => ({
  authenticate: jest.fn()
}))

let req
let res
let authController: RedisAuthController
let redisPupilAuthService: IPupilAuthenticationService

describe('redis auth controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    req.body = { schoolPin: 'pin1', pupilPin: 'pin2' }
    res = httpMocks.createResponse()
    redisPupilAuthService = new RedisPupilAuthServiceMock()
    authController = new RedisAuthController(redisPupilAuthService)
  })

  test('returns an 400 error if the request is not JSON', async () => {
    req = createMockRequest('text/html')
    spyOn(logger, 'error')
    await authController.postAuth(req, res)
    expect(res.statusCode).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Bad request')
  })

  test('allows a content-type of application/json', async () => {
    redisPupilAuthService.authenticate = jest.fn(async () => {
      return {}
    })
    req = createMockRequest('application/json')
    req.body = {
      schoolPin: 'abc12def',
      pupilPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(res.statusCode).toBe(200)
  })

  test('allows a content-type of application/json with a charset', async () => {
    redisPupilAuthService.authenticate = jest.fn(async () => {
      return {}
    })
    req = createMockRequest('application/json; charset=utf-8')
    req.body = {
      schoolPin: 'abc12def',
      pupilPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(res.statusCode).toBe(200)
  })

  test('returns unauthorised if the login failed', async () => {
    spyOn(logger, 'error')
    await authController.postAuth(req, res)
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  test('shortcuts to return unauthorised if no schoolPin provided', async () => {
    spyOn(logger, 'error')
    req.body = {
      pupilPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(redisPupilAuthService.authenticate).not.toHaveBeenCalled()
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  test('shortcuts to return unauthorised if no pupilPin provided', async () => {
    spyOn(logger, 'error')
    req.body = {
      schoolPin: '1234'
    }
    await authController.postAuth(req, res)
    expect(redisPupilAuthService.authenticate).not.toHaveBeenCalled()
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  test('returns a data packet to the client if authorisation is successful', async () => {
    redisPupilAuthService.authenticate = jest.fn(async () => {
      return {}
    })
    await authController.postAuth(req, res)
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(200)
    expect(data).toBeTruthy()
  })

  test('returns a 401 if no redis preparedCheck found', async () => {
    redisPupilAuthService.authenticate = jest.fn((schoolPin: string, pupilPin: string) => {
      return undefined
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
