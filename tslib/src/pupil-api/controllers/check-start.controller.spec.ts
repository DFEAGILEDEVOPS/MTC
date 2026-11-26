import * as httpMocks from 'node-mocks-http'
import { CheckStartController } from './check-start.controller.js'

const checkCode = '11111111-1111-4111-8111-111111111111'
const attemptId = '22222222-2222-4222-8222-222222222222'

describe('CheckStartController', () => {
  const jwtService = { verify: jest.fn() }
  const dataService = { acknowledgeStart: jest.fn() }
  const controller = new CheckStartController(jwtService, dataService)

  beforeEach(() => {
    jest.resetAllMocks()
    jwtService.verify.mockResolvedValue({ checkCode })
    dataService.acknowledgeStart.mockResolvedValue(true)
  })

  function request () {
    return httpMocks.createRequest({
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': '100', authorization: 'Bearer token' },
      body: { checkCode, attemptId }
    })
  }

  test('acknowledges a start for the check bound to the signed token', async () => {
    const res = httpMocks.createResponse()
    await controller.postStart(request(), res)
    expect(res.statusCode).toBe(200)
    expect(dataService.acknowledgeStart).toHaveBeenCalledWith(checkCode, attemptId)
  })

  test('reports the emergency switch without acknowledging a new start', async () => {
    dataService.acknowledgeStart.mockResolvedValue(false)
    const res = httpMocks.createResponse()
    await controller.postStart(request(), res)
    expect(res.statusCode).toBe(503)
    expect(JSON.parse(res._getData()).code).toBe('EMERGENCY_OFF_SWITCH_ENABLED')
  })

  test('rejects a token belonging to another check', async () => {
    jwtService.verify.mockResolvedValue({ checkCode: attemptId })
    const res = httpMocks.createResponse()
    await controller.postStart(request(), res)
    expect(res.statusCode).toBe(401)
    expect(dataService.acknowledgeStart).not.toHaveBeenCalled()
  })

  test('rejects an invalid attempt id', async () => {
    const req = request()
    req.body.attemptId = 'invalid'
    const res = httpMocks.createResponse()
    await controller.postStart(req, res)
    expect(res.statusCode).toBe(400)
    expect(dataService.acknowledgeStart).not.toHaveBeenCalled()
  })

  test('rejects a missing body', async () => {
    const req = request()
    req.body = undefined
    const res = httpMocks.createResponse()
    await controller.postStart(req, res)
    expect(res.statusCode).toBe(400)
    expect(dataService.acknowledgeStart).not.toHaveBeenCalled()
  })

  test('rejects a missing or invalid token', async () => {
    const req = request()
    delete req.headers.authorization
    const res = httpMocks.createResponse()
    await controller.postStart(req, res)
    expect(res.statusCode).toBe(401)

    jwtService.verify.mockRejectedValue(new Error('invalid token'))
    const invalidRes = httpMocks.createResponse()
    await controller.postStart(request(), invalidRes)
    expect(invalidRes.statusCode).toBe(401)
    expect(dataService.acknowledgeStart).not.toHaveBeenCalled()
  })

  test('returns a server error if acknowledgement fails', async () => {
    dataService.acknowledgeStart.mockRejectedValue(new Error('database unavailable'))
    const res = httpMocks.createResponse()
    await controller.postStart(request(), res)
    expect(res.statusCode).toBe(500)
  })
})
