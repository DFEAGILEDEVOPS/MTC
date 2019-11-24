import { PupilAuthService, IPupilAuthFunctionBindings } from './pupil-auth.service'
import { IRedisService } from '../../caching/redis-service'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { HttpRequest } from '@azure/functions'
let sut: PupilAuthService
let redisMock: IRedisService
let req: HttpRequest
let bindings: IPupilAuthFunctionBindings

describe('pupil-auth.service', () => {
  beforeEach(() => {
    redisMock = new RedisServiceMock()
    sut = new PupilAuthService(redisMock)
    req = {
      body: {
        schoolPin: 'abc12def',
        pupilPin: '1234'
      },
      method: 'POST',
      headers: {},
      params: {},
      query: {},
      rawBody: {},
      url: ''
    }
    bindings = {
      pupilLoginQueue: []
    }
  })

  test('subject is defined', () => {
    expect(sut).toBeDefined()
  })

  test('short circuit if request body missing', async () => {
    req.body = undefined
    const res = await sut.authenticate2(req, bindings)
    expect(redisMock.get).not.toHaveBeenCalled()
    expect(res).toBeDefined()
    expect(res.status).toBeDefined()
    expect(res.status).toBe(401)
  })

  test('short circuit if pupilPin missing', async () => {
    req.body.pupilPin = undefined
    const res = await sut.authenticate2(req, bindings)
    expect(redisMock.get).not.toHaveBeenCalled()
    expect(res).toBeDefined()
    expect(res.status).toBeDefined()
    expect(res.status).toBe(401)
  })

  test('short circuit if schoolPin missing', async () => {
    req.body.schoolPin = undefined
    const res = await sut.authenticate2(req, bindings)
    expect(redisMock.get).not.toHaveBeenCalled()
    expect(res).toBeDefined()
    expect(res.status).toBeDefined()
    expect(res.status).toBe(401)
  })

  test('options method returns relevant info', async () => {
    req.method = 'OPTIONS'
    const res = await sut.authenticate2(req, bindings)
    expect(res.body).toBe('')
    expect(res.headers).toStrictEqual({
      'Access-Control-Allow-Methods' : 'POST,OPTIONS',
      'allow' : 'POST,OPTIONS'
    })
    expect(res.status).toBe(200)
  })

  test('post method attempts redis lookup of preparedCheck', async () => {
    await sut.authenticate2(req, bindings)
    const expectedKey = `preparedCheck:${req.body.schoolPin}:${req.body.pupilPin}`
    expect(redisMock.get).toHaveBeenCalledWith(expectedKey)
  })

  test('invalid credentials returns 401', async () => {
    await sut.authenticate2(req, bindings)
    expect(redisMock.get).toHaveBeenCalled()
  })
  test.todo('valid credentials returns 200')
  test.todo('valid credentials returns 200')
})
