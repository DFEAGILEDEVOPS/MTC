import { SubmitController, MaxPayloadSize } from './submit.controller'
import * as httpMocks from 'node-mocks-http'
import type { Request, Response } from 'express'
import logger from '../services/log.service'
import { type IJwtService } from '../../services/jwt.service'
import { type ICheckSubmitService } from '../../services/check-submit.service'
import { ServiceBusError } from '@azure/service-bus'

let req: Request
let res: Response
let sut: SubmitController
let jwtServiceMock: IJwtService
let checkSubmitServiceMock: ICheckSubmitService

function createMockRequest (contentType: string): any {
  return httpMocks.createRequest({
    method: 'POST',
    url: '/submit',
    headers: {
      'Content-Type': `${contentType}`,
      'Content-Length': '42' // needed to make `req.is` work
    }
  })
}

class JwtServiceMock implements IJwtService {
  async sign (payload: object, signingOptions: any): Promise<string> {
    return `${JSON.stringify(payload)}:${JSON.stringify(signingOptions)}`
  }

  async verify (token: string): Promise<string | object> {
    return token
  }
}

class CheckSubmitServiceMock implements ICheckSubmitService {
  async submit (): Promise<void> {
    return
  }
}

describe('submit controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    req.body = { checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b' }
    res = httpMocks.createResponse()
    jwtServiceMock = new JwtServiceMock()
    checkSubmitServiceMock = new CheckSubmitServiceMock()
    sut = new SubmitController(jwtServiceMock, checkSubmitServiceMock)
  })

  test('returns an 400 error if the request is not JSON', async () => {
    req = createMockRequest('text/html')
    jest.spyOn(logger, 'error').mockImplementation()
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(400)
  })

  test('allows a content-type of application/json', async () => {
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer 123'
    req.body = { checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b' }
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(200)
  })

  test('returns 401 if the JWT is not present', async () => {
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(401)
  })

  test('returns 401 if the JWT is not verified', async () => {
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer 123'
    req.body = { checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b' }
    jest.spyOn(jwtServiceMock, 'verify').mockRejectedValue(new Error('JWT verification failed'))
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(401)
  })

  test('returns 413 if the archive property of the payload is too large', async () => {
    const archive = getString(MaxPayloadSize + 1)
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer 123'
    req.body = {
      checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b',
      archive
    }
    jest.spyOn(jwtServiceMock, 'verify').mockResolvedValue('true')
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(413) // too large
  })

  test('the largest size payload is accepted', async () => {
    const archive = getString(MaxPayloadSize)
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer 123'
    req.body = {
      checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b',
      archive
    }
    jest.spyOn(jwtServiceMock, 'verify').mockResolvedValue('true')
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(200) // accepted
  })

  test('it sends a 413 status code if the service bus rejects the message', async () => {
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer 123'
    req.body = {
      checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b',
      archive: '-'
    }
    jest.spyOn(jwtServiceMock, 'verify').mockResolvedValue('true')
    const err = new ServiceBusError('test service bus rejection', 'MessageSizeExceeded')
    jest.spyOn(checkSubmitServiceMock, 'submit').mockRejectedValue(err)
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(413) // rejected for being too large
  })

  test('it sends a 500 server error response if the service bus rejects for an unknown reason', async () => {
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer 123'
    req.body = {
      checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b',
      archive: '-'
    }
    jest.spyOn(jwtServiceMock, 'verify').mockResolvedValue('true')
    const err = new ServiceBusError('test service bus rejection', 'ServiceBusy')
    jest.spyOn(checkSubmitServiceMock, 'submit').mockRejectedValue(err)
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(500) // Generic error
  })
})

function getString (n: number): string {
  let str = ''
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charLen = characters.length
  for (let i = 0; i < n; i++) {
    // Generating a random index
    const idx = Math.floor(Math.random() * charLen)
    str += characters.charAt(idx)
  }
  return str
}
