import * as httpMocks from 'node-mocks-http'
import type { Request, Response } from 'express'
import logger from '../services/log.service'
import { type IJwtService } from '../../services/jwt.service'
import { PupilFeedbackController } from './feedback.controller'

let req: Request
let res: Response
let sut: PupilFeedbackController
let jwtServiceMock: IJwtService

function createMockRequest (contentType: string): any {
  return httpMocks.createRequest({
    method: 'POST',
    url: '/feedback',
    headers: {
      'Content-Type': `${contentType}`,
      'Content-Length': '42'
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

describe('Pupil Feedback Controller', () => {
  beforeEach(() => {
    req = createMockRequest('application/json')
    res = httpMocks.createResponse()
    jwtServiceMock = new JwtServiceMock()
    sut = new PupilFeedbackController(jwtServiceMock)
  })

  test('returns an 400 error if the request is not JSON', async () => {
    req = createMockRequest('text/html')
    jest.spyOn(logger, 'error').mockImplementation()
    await sut.postFeedback(req, res)
    expect(res.statusCode).toBe(400)
  })
})
