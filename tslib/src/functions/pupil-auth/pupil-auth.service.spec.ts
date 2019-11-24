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

  test('401 returned if request body missing', async () => {
    req.body = undefined
    const res = await sut.authenticate2(bindings, req)
    expect(redisMock.get).not.toHaveBeenCalled()
    expect(res).toBeDefined()
    expect(res.status).toBeDefined()
    expect(res.status).toBe(401)
  })

  test('401 returned if pupilPin missing', async () => {
    req.body.pupilPin = undefined
    const res = await sut.authenticate2(bindings, req)
    expect(redisMock.get).not.toHaveBeenCalled()
    expect(res).toBeDefined()
    expect(res.status).toBeDefined()
    expect(res.status).toBe(401)
  })

  test('401 returned if schoolPin missing', async () => {
    req.body.schoolPin = undefined
    const res = await sut.authenticate2(bindings, req)
    expect(redisMock.get).not.toHaveBeenCalled()
    expect(res).toBeDefined()
    expect(res.status).toBeDefined()
    expect(res.status).toBe(401)
  })

  test('options method returns relevant info', async () => {
    req.method = 'OPTIONS'
    const res = await sut.authenticate2(bindings, req)
    expect(res.body).toBe('')
    expect(res.headers).toStrictEqual({
      'Access-Control-Allow-Methods' : 'POST,OPTIONS',
      'allow' : 'POST,OPTIONS'
    })
    expect(res.status).toBe(200)
  })

  test('post method attempts redis lookup of preparedCheck', async () => {
    await sut.authenticate2(bindings, req)
    const expectedKey = `preparedCheck:${req.body.schoolPin}:${req.body.pupilPin}`
    expect(redisMock.get).toHaveBeenCalledWith(expectedKey)
  })

  test('invalid credentials returns 401', async () => {
    const res = await sut.authenticate2(bindings, req)
    expect(res.status).toBe(401)
  })

  test('valid credentials returns 200', async () => {
    const preparedCheck = {
      checkCode: 'abc',
      config: {
        practice: false
      }
    }
    redisMock.get = jest.fn(async (key) => {
      return preparedCheck
    })
    const res = await sut.authenticate2(bindings, req)
    expect(res.status).toBe(200)
    expect(res.body).toEqual(preparedCheck)
  })

  test('when prepared check found, lookup key is added to redis', async () => {
    const preparedCheck = {
      checkCode: 'abc',
      config: {
        practice: false
      }
    }
    redisMock.get = jest.fn(async (key) => {
      return preparedCheck
    })
    const preparedCheckKey = `preparedCheck:${req.body.schoolPin}:${req.body.pupilPin}`
    const lookupKey = `check-started-check-lookup:${preparedCheck.checkCode}`
    await sut.authenticate2(bindings, req)
    expect(redisMock.setex).toHaveBeenCalledWith(lookupKey, preparedCheckKey, 28800)
  })

  test('expire if live check', async () => {
    const preparedCheck = {
      checkCode: 'abc',
      config: {
        practice: false
      }
    }
    redisMock.get = jest.fn(async (key) => {
      return preparedCheck
    })
    const expectedKey = `preparedCheck:${req.body.schoolPin}:${req.body.pupilPin}`
    await sut.authenticate2(bindings, req)
    expect(redisMock.expire).toHaveBeenCalledWith(expectedKey, 1800)
  })

  test('pupilLogin message is put on the queue', async () => {
    const preparedCheck = {
      checkCode: 'abc',
      config: {
        practice: false
      }
    }
    redisMock.get = jest.fn(async (key) => {
      return preparedCheck
    })
    const res = await sut.authenticate2(bindings, req)
    expect(res.status).toBe(200)
    expect(bindings.pupilLoginQueue.length).toBe(1)
    const pupilLoginMessage = bindings.pupilLoginQueue[0]
    expect(pupilLoginMessage.checkCode).toBe(preparedCheck.checkCode)
    expect(pupilLoginMessage.loginAt).toBeDefined()
    expect(pupilLoginMessage.version).toBe(1)
  })
})
