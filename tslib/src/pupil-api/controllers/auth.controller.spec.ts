import { RedisAuthController } from './auth.controller'
import * as httpMocks from 'node-mocks-http'
import logger from '../services/log.service'
import type { IPupilAuthenticationService } from '../services/redis-pupil-auth.service'
import type { Request } from 'express'

class RedisPupilAuthServiceMock implements IPupilAuthenticationService {
  async authenticate (): Promise<object | undefined> {
    return undefined
  }
}

let req: Request
let res: any
let sut: RedisAuthController
let redisPupilAuthService: IPupilAuthenticationService

describe('redis auth controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    req.body = { schoolPin: 'pin1', pupilPin: 'pin2', buildVersion: '1' }
    res = httpMocks.createResponse()
    redisPupilAuthService = new RedisPupilAuthServiceMock()
    sut = new RedisAuthController(redisPupilAuthService)
    jest.spyOn(redisPupilAuthService, 'authenticate')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns an 400 error if the request is not JSON', async () => {
    req = createMockRequest('text/html')
    jest.spyOn(logger, 'error').mockImplementation()
    await sut.postAuth(req, res)
    expect(res.statusCode).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Bad request')
  })

  test('allows a content-type of application/json', async () => {
    jest.spyOn(redisPupilAuthService, 'authenticate').mockResolvedValue({})
    req = createMockRequest('application/json')
    req.body = {
      schoolPin: 'abc12def',
      pupilPin: '1234',
      buildVersion: '123'
    }
    await sut.postAuth(req, res)
    expect(res.statusCode).toBe(200)
  })

  test('allows a content-type of application/json with a charset', async () => {
    jest.spyOn(redisPupilAuthService, 'authenticate').mockResolvedValue({})
    req = createMockRequest('application/json; charset=utf-8')
    req.body = {
      schoolPin: 'abc12def',
      pupilPin: '1234',
      buildVersion: '123'
    }
    await sut.postAuth(req, res)
    expect(res.statusCode).toBe(200)
  })

  test('returns unauthorised if the login failed', async () => {
    jest.spyOn(logger, 'error').mockImplementation()
    await sut.postAuth(req, res)
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  test('shortcuts to return unauthorised if no schoolPin provided', async () => {
    jest.spyOn(logger, 'error').mockImplementation()
    req.body = {
      pupilPin: '1234',
      buildVersion: '123'
    }
    await sut.postAuth(req, res)
    expect(redisPupilAuthService.authenticate).not.toHaveBeenCalled()
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  test('shortcuts to return unauthorised if no pupilPin provided', async () => {
    jest.spyOn(logger, 'error').mockImplementation()
    req.body = {
      schoolPin: '1234',
      buildVersion: '123'
    }
    await sut.postAuth(req, res)
    expect(redisPupilAuthService.authenticate).not.toHaveBeenCalled()
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  test('shortcuts to return unauthorised if no build version provided', async () => {
    jest.spyOn(logger, 'error').mockImplementation()
    req.body = {
      pupilPin: '123',
      schoolPin: 'def4ger'
      // buildVersion: '42' // we do not want a build version
    }
    await sut.postAuth(req, res)
    expect(redisPupilAuthService.authenticate).not.toHaveBeenCalled()
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(401)
    expect(data.error).toBe('Unauthorised')
  })

  test('returns a data packet to the client if authorisation is successful', async () => {
    jest.spyOn(redisPupilAuthService, 'authenticate').mockResolvedValue({})

    await sut.postAuth(req, res)
    const data = JSON.parse(res._getData())
    expect(res.statusCode).toBe(200)
    expect(data).toBeDefined()
  })

  test('returns a 401 if no redis preparedCheck found', async () => {
    jest.spyOn(redisPupilAuthService, 'authenticate').mockResolvedValue(undefined)
    await sut.postAuth(req, res)
    expect(res.statusCode).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Unauthorised')
  })

  test('trims leading whitespace from the schoolPin', async () => {
    req.body = {
      pupilPin: '123',
      schoolPin: ' abc',
      buildVersion: '123'
    }
    const redisPupilAuthServiceMock = jest.spyOn(redisPupilAuthService, 'authenticate').mockResolvedValue({})
    await sut.postAuth(req, res)
    expect(res.statusCode).toBe(200) // it succeeds even though the leading space is superflous
    const authArgs = redisPupilAuthServiceMock.mock.calls[0]
    expect(authArgs[0]).toBe('abc') // leading space removed
  })

  test('trims trailing whitespace from the schoolPin', async () => {
    req.body = {
      pupilPin: '123',
      schoolPin: 'def   ',
      buildVersion: '123'
    }
    const redisPupilAuthServiceMock = jest.spyOn(redisPupilAuthService, 'authenticate').mockResolvedValue({})
    await sut.postAuth(req, res)
    expect(res.statusCode).toBe(200) // it succeeds even though the trailing space is superflous
    const authArgs = redisPupilAuthServiceMock.mock.calls[0]
    expect(authArgs[0]).toBe('def') // trailing space removed
  })

  test('trims leading and trailing whitespace from the schoolPin', async () => {
    req.body = {
      pupilPin: '123',
      schoolPin: '  xyz   ',
      buildVersion: '123'
    }
    const redisPupilAuthServiceMock = jest.spyOn(redisPupilAuthService, 'authenticate').mockResolvedValue({})
    await sut.postAuth(req, res)
    expect(res.statusCode).toBe(200) // it succeeds even though the trailing space is superflous
    const authArgs = redisPupilAuthServiceMock.mock.calls[0]
    expect(authArgs[0]).toBe('xyz') // trailing space removed
  })
})

function createMockRequest (contentType: string): any {
  return httpMocks.createRequest({
    method: 'POST',
    url: '/auth',
    headers: {
      'Content-Type': `${contentType}`,
      'Content-Length': '42' // needed to make `req.is` work
    }
  })
}
