import { SubmitController, MaxPayloadSize } from './submit.controller.js'
import * as httpMocks from 'node-mocks-http'
import type { Request, Response } from 'express'
import logger from '../services/log.service.js'
import { type IJwtService } from '../../services/jwt.service.js'
import { type ICheckSubmitService } from '../../services/check-submit.service.js'
import { ServiceBusError } from '@azure/service-bus'

let req: Request
let res: Response
let sut: SubmitController
let jwtServiceMock: IJwtService
let checkSubmitServiceMock: ICheckSubmitService
let eligibilityMock: { isSubmissionAllowed: jest.Mock }
const checkCode = '38f666df-244c-4dff-828f-4ffad7e60e4b'
const attemptId = 'c5082eb1-0855-4d26-9447-b5798243b640'

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
    eligibilityMock = { isSubmissionAllowed: jest.fn().mockResolvedValue(true) }
    sut = new SubmitController(jwtServiceMock, checkSubmitServiceMock, eligibilityMock)
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

  test('returns 401 if the JWT is incorrectly formatted', async () => {
    req = createMockRequest('application/json')
    req.headers.authorization = 'Bearer '
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

  test('allows an acknowledged attempt and preserves it for submission retries', async () => {
    req.headers.authorization = 'Bearer 123'
    req.body = { checkCode, attemptId, archive: '-' }
    jest.spyOn(jwtServiceMock, 'verify').mockResolvedValue({ checkCode })
    const submit = jest.spyOn(checkSubmitServiceMock, 'submit')
      .mockRejectedValueOnce(new Error('temporary queue failure'))
      .mockResolvedValueOnce()

    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(500)
    const retryRes = httpMocks.createResponse()
    await sut.postSubmit(req, retryRes)
    expect(retryRes.statusCode).toBe(200)
    expect(eligibilityMock.isSubmissionAllowed).toHaveBeenCalledTimes(2)
    expect(eligibilityMock.isSubmissionAllowed).toHaveBeenCalledWith(checkCode, attemptId)
    expect(submit).toHaveBeenCalledTimes(2)
  })

  test('blocks an unacknowledged or different attempt when the switch is enabled', async () => {
    req.headers.authorization = 'Bearer 123'
    req.body = { checkCode, attemptId }
    const response = httpMocks.createResponse()
    jest.spyOn(jwtServiceMock, 'verify').mockResolvedValue({ checkCode })
    eligibilityMock.isSubmissionAllowed.mockResolvedValue(false)
    const submit = jest.spyOn(checkSubmitServiceMock, 'submit')
    await sut.postSubmit(req, response)
    expect(response.statusCode).toBe(503)
    expect(JSON.parse(response._getData()).code).toBe('EMERGENCY_OFF_SWITCH_ENABLED')
    expect(eligibilityMock.isSubmissionAllowed).toHaveBeenCalledWith(checkCode, attemptId)
    expect(submit).not.toHaveBeenCalled()
  })

  test.each([
    ['missing attempt', undefined, checkCode],
    ['invalid attempt', 'invalid', checkCode],
    ['different token check', attemptId, '11111111-1111-4111-8111-111111111111']
  ])('does not grant an emergency exception for %s', async (_label, submittedAttempt, tokenCheckCode) => {
    req.headers.authorization = 'Bearer 123'
    req.body = { checkCode, attemptId: submittedAttempt }
    jest.spyOn(jwtServiceMock, 'verify').mockResolvedValue({ checkCode: tokenCheckCode })
    eligibilityMock.isSubmissionAllowed.mockResolvedValue(false)
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(503)
    expect(eligibilityMock.isSubmissionAllowed).toHaveBeenCalledWith(
      tokenCheckCode === checkCode ? checkCode : null,
      submittedAttempt === attemptId ? attemptId : null
    )
  })

  test('returns a retryable error if eligibility cannot be determined', async () => {
    req.headers.authorization = 'Bearer 123'
    eligibilityMock.isSubmissionAllowed.mockRejectedValue(new Error('database unavailable'))
    const submit = jest.spyOn(checkSubmitServiceMock, 'submit')
    await sut.postSubmit(req, res)
    expect(res.statusCode).toBe(500)
    expect(submit).not.toHaveBeenCalled()
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
