import { SubmitController } from './submit.controller'
import * as httpMocks from 'node-mocks-http'
import type { Request, Response } from 'express'
import logger from '../services/log.service'
import { type IJwtService } from '../../services/jwt.service'

let req: Request
let res: Response
let sut: SubmitController
let jwtServiceMock: IJwtService

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
    return '123'
  }

  async verify (token: string): Promise<string | object> {
    return token
  }
}

describe('submit controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    req.body = { checkCode: '38f666df-244c-4dff-828f-4ffad7e60e4b' }
    res = httpMocks.createResponse()
    jwtServiceMock = new JwtServiceMock()
    sut = new SubmitController(jwtServiceMock)
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
})
