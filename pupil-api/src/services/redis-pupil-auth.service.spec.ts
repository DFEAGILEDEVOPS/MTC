import { RedisPupilAuthenticationService } from './redis-pupil-auth.service'
import { IRedisService } from './redis.service'

let sut: RedisPupilAuthenticationService
let redisServiceMock: IRedisService

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn(),
  drop: jest.fn(),
  quit: jest.fn()
}))

describe('redis-pupil-auth.service', () => {

  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    sut = new RedisPupilAuthenticationService(redisServiceMock)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should call redis:get with correct key format', async () => {
    let actualKey: string
    redisServiceMock.get = jest.fn((key: string) => {
      actualKey = key
      return Promise.resolve()
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const expectedKey = `preparedCheck:${schoolPin}:${pupilPin}`
    await sut.authenticate(schoolPin, pupilPin)
    expect(actualKey).toEqual(expectedKey)
  })

  test('an error should be thrown if either argument is an empty string', async () => {
    let schoolPin = 'abc12def'
    let pupilPin = ''
    try {
      await sut.authenticate(schoolPin, pupilPin)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error.message).toBe('schoolPin and pupilPin cannot be an empty string')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
    schoolPin = ''
    pupilPin = '1234'
    try {
      await sut.authenticate(schoolPin, pupilPin)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error.message).toBe('schoolPin and pupilPin cannot be an empty string')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })

  test('the check payload should be returned if item found in cache', async () => {
    const expectedPayload = {
      foo: 'bar'
    }
    redisServiceMock.get = jest.fn((key: string) => {
      return Promise.resolve(expectedPayload)
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const payload = await sut.authenticate(schoolPin, pupilPin)
    expect(payload).toEqual(expectedPayload)
  })

  test('a lookup link should be added to redis for check-started function', async () => {
    const expectedPayload = {
      checkCode: 'the-check-code'
    }
    redisServiceMock.get = jest.fn((key: string) => {
      return Promise.resolve(expectedPayload)
    })
    const eightHoursInSeconds = 28800
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    await sut.authenticate(schoolPin, pupilPin)
    const preparedCheckKey = `preparedCheck:${schoolPin}:${pupilPin}`
    const checkStartedKey = `check-started-check-lookup:${expectedPayload.checkCode}`
    expect(redisServiceMock.setex).toHaveBeenCalledWith(checkStartedKey, preparedCheckKey, eightHoursInSeconds)
  })

  test('null should be returned if item not found in cache', async () => {
    redisServiceMock.get = jest.fn((key: string) => {
      return Promise.resolve(undefined)
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const payload = await sut.authenticate(schoolPin, pupilPin)
    expect(payload).toBeNull()
  })
})
