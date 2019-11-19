import { RedisPupilAuthenticationService } from './redis-pupil-auth.service'
import { IRedisService } from './redis.service'
import { stringLiteral } from '@babel/types'

let sut: RedisPupilAuthenticationService
let redisServiceMock: IRedisService

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn(),
  drop: jest.fn(),
  quit: jest.fn(),
  expire: jest.fn()
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
    redisServiceMock.get = jest.fn(async (key: string) => {
      actualKey = key
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
      config: {
        practice: true
      }
    }
    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const payload = await sut.authenticate(schoolPin, pupilPin)
    expect(payload).toEqual(expectedPayload)
  })

  test('a lookup link should be added to redis for check-started function', async () => {
    const expectedPayload = {
      checkCode: 'the-check-code',
      config: {
        practice: true
      }
    }
    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
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

  test('redis item TTL should be set to 30 minutes from now if config.practice is defined and false', async () => {
    const thirtyMinutesInSeconds = 1800
    const eightHoursInSeconds = 28800
    const expectedPayload = {
      config: {
        practice: false
      }
    }

    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    let actualLookupKeyExpiryValue: number
    redisServiceMock.setex = jest.fn(async (key: string, value: string | object, ttl: number) => {
      actualLookupKeyExpiryValue = ttl
    })
    let actualPreparedCheckExpiryValue: number
    redisServiceMock.expire = jest.fn(async (key: string, ttl: number) => {
      actualPreparedCheckExpiryValue = ttl
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    await sut.authenticate(schoolPin, pupilPin)
    expect(actualLookupKeyExpiryValue).toEqual(eightHoursInSeconds)
    expect(actualPreparedCheckExpiryValue).toEqual(thirtyMinutesInSeconds)
  })

  test('no redis expiry is set if config.practice is true', async () => {

    const expectedPayload = {
      config: {
        practice: true
      }
    }

    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    let actualLookupKeyExpiryValue: number
    redisServiceMock.setex = jest.fn(async (key: string, value: string | object, ttl: number) => {
      actualLookupKeyExpiryValue = ttl
    })
    let actualPreparedCheckExpiryValue: number
    redisServiceMock.expire = jest.fn(async (key: string, ttl: number) => {
      actualPreparedCheckExpiryValue = ttl
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    await sut.authenticate(schoolPin, pupilPin)
    expect(redisServiceMock.expire).not.toHaveBeenCalled()
  })

  test('no redis expiry is set if config.practice does not exist', async () => {

    const expectedPayload = {
      config: {}
    }

    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    let actualLookupKeyExpiryValue: number
    redisServiceMock.setex = jest.fn(async (key: string, value: string | object, ttl: number) => {
      actualLookupKeyExpiryValue = ttl
    })
    let actualPreparedCheckExpiryValue: number
    redisServiceMock.expire = jest.fn(async (key: string, ttl: number) => {
      actualPreparedCheckExpiryValue = ttl
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    await sut.authenticate(schoolPin, pupilPin)
    expect(redisServiceMock.expire).not.toHaveBeenCalled()
  })

  test('no redis expiry is set if config.practice is undefined', async () => {

    const expectedPayload = {
      config: {
        practice: undefined
      }
    }

    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    let actualLookupKeyExpiryValue: number
    redisServiceMock.setex = jest.fn(async (key: string, value: string | object, ttl: number) => {
      actualLookupKeyExpiryValue = ttl
    })
    let actualPreparedCheckExpiryValue: number
    redisServiceMock.expire = jest.fn(async (key: string, ttl: number) => {
      actualPreparedCheckExpiryValue = ttl
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    await sut.authenticate(schoolPin, pupilPin)
    expect(redisServiceMock.expire).not.toHaveBeenCalled()
  })
})
