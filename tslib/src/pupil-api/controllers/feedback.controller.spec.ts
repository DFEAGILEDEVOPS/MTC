import * as httpMocks from 'node-mocks-http'
import type { Request, Response } from 'express'
import logger from '../services/log.service'
import { type IJwtService } from '../../services/jwt.service'
import { PupilFeedbackController } from './feedback.controller'
import { type IPupilFeedbackService } from '../services/feedback.service'

let req: Request
let res: Response
let sut: PupilFeedbackController
let jwtServiceMock: IJwtService
let pupilFeedbackServiceMock: IPupilFeedbackService

function createMockRequest (contentType: string): any {
  return httpMocks.createRequest({
    method: 'POST',
    url: '/feedback',
    headers: {
      'Content-Type': `${contentType}`,
      'Content-Length': '42',
      authorization: 'Bearer token'
    }
  })
}

class PupilFeedbackServiceMock implements IPupilFeedbackService {
  async putFeedbackOnQueue (payload: any): Promise<void> {}
}

class JwtServiceMock implements IJwtService {
  async sign (payload: object, signingOptions: any): Promise<string> {
    return `${JSON.stringify(payload)}:${JSON.stringify(signingOptions)}`
  }

  async verify (token: string): Promise<string | object> {
    return token
  }
}

describe('Pupil Feedback Controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    res = httpMocks.createResponse()
    pupilFeedbackServiceMock = new PupilFeedbackServiceMock()
    jwtServiceMock = new JwtServiceMock()
    sut = new PupilFeedbackController(jwtServiceMock, pupilFeedbackServiceMock)
  })

  test('returns an 400 error if the request is not JSON', async () => {
    req = createMockRequest('text/html')
    jest.spyOn(logger, 'error').mockImplementation()
    await sut.postFeedback(req, res)
    expect(res.statusCode).toBe(400)
  })

  test('returns an 401 error if the request does not contain an authorization header', async () => {
    req = createMockRequest('application/json')
    jest.spyOn(logger, 'error').mockImplementation()
    req.headers.authorization = undefined
    await sut.postFeedback(req, res)
    expect(res.statusCode).toBe(401)
  })

  test('returns an 401 error if the token is incorrectly formatted', async () => {
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer '
    await sut.postFeedback(req, res)
    expect(res.statusCode).toBe(401)
  })

  test('returns an 401 error if the token is invalid', async () => {
    req = createMockRequest('application/json')
    jest.spyOn(jwtServiceMock, 'verify').mockRejectedValue(new Error('Invalid token'))
    await sut.postFeedback(req, res)
    expect(res.statusCode).toBe(401)
  })

  test('returns 200 OK if the token is valid', async () => {
    req = createMockRequest('application/json')
    await sut.postFeedback(req, res)
    expect(res.statusCode).toBe(200)
  })

  test('passes the payload to the feedback service if authentication successful', async () => {
    req = createMockRequest('application/json')
    jest.spyOn(pupilFeedbackServiceMock, 'putFeedbackOnQueue').mockResolvedValue()
    await sut.postFeedback(req, res)
    expect(pupilFeedbackServiceMock.putFeedbackOnQueue).toHaveBeenCalledWith(req.body)
  })
})
