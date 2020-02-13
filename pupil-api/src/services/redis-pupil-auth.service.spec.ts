import * as moment from 'moment'

import { RedisPupilAuthenticationService, IPupilLoginMessage } from './redis-pupil-auth.service'
import { IRedisService } from './redis.service'
import { IQueueMessageService, IServiceBusQueueMessage } from './queue-message.service'

let sut: RedisPupilAuthenticationService
let redisServiceMock: IRedisService
let messageDispatchMock: IQueueMessageService

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn(),
  drop: jest.fn(),
  quit: jest.fn(),
  ttl: jest.fn(),
  expire: jest.fn()
}))

const MessageDispatchMock = jest.fn<IQueueMessageService, any>(() => ({
  dispatch: jest.fn()
}))

describe('redis-pupil-auth.service', () => {

  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    messageDispatchMock = new MessageDispatchMock()
    sut = new RedisPupilAuthenticationService(redisServiceMock, messageDispatchMock)
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

  test('the check payload should be returned if item found in cache and the pin is valid', async () => {
    const pinValidFromUtc = moment().startOf('day')
    const pinExpiresAtUtc = moment().endOf('day')
    const expectedPayload = {
      config: {
        practice: true
      },
      pinValidFromUtc: pinValidFromUtc,
      pinExpiresAtUtc: pinExpiresAtUtc
    }
    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const payload = await sut.authenticate(schoolPin, pupilPin)
    expect(payload).toEqual(expectedPayload)
  })

  test('authorisation is denied if the pin is not yet valid', async () => {
    const currentDateTime = moment.utc()
    const pinValidFromUtc = moment().add(1, 'hour')
    const pinExpiresAtUtc = moment().add(2, 'hour')
    const expectedPayload = {
      config: {
        practice: false
      },
      pinValidFromUtc: pinValidFromUtc,
      pinExpiresAtUtc: pinExpiresAtUtc
    }
    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const payload = await sut.authenticate(schoolPin, pupilPin)
    expect(payload).toBeUndefined()
  })

  test('authorisation is denied if the pin was valid in the past', async () => {
    const currentDateTime = moment.utc()
    const pinValidFromUtc = moment().subtract(2, 'hour')
    const pinExpiresAtUtc = moment().subtract(1, 'hour')
    const expectedPayload = {
      config: {
        practice: false
      },
      pinValidFromUtc: pinValidFromUtc,
      pinExpiresAtUtc: pinExpiresAtUtc
    }
    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const payload = await sut.authenticate(schoolPin, pupilPin)
    expect(payload).toBeUndefined()
  })

  test('null should be returned if item not found in cache', async () => {
    redisServiceMock.get = jest.fn((key: string) => {
      return Promise.resolve(undefined)
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const payload = await sut.authenticate(schoolPin, pupilPin)
    expect(payload).toBeUndefined()
  })

  test('redis item TTL should be set to 30 minutes from now if config.practice is defined and false', async () => {
    const thirtyMinutesInSeconds = 1800
    const expectedPayload = {
      config: {
        practice: false
      }
    }

    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })

    let actualPreparedCheckExpiryValue: number
    redisServiceMock.expire = jest.fn(async (key: string, ttl: number) => {
      actualPreparedCheckExpiryValue = ttl
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    await sut.authenticate(schoolPin, pupilPin)
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

  test('pupil-login message should be dispatched upon successful authentication', async () => {
    const expectedPayload = {
      checkCode: 'check-code',
      config: {
        practice: true
      }
    }
    redisServiceMock.get = jest.fn(async (key: string) => {
      return expectedPayload
    })

    let actualMessage: IPupilLoginMessage
    messageDispatchMock.dispatch = jest.fn(async (message) => {
      actualMessage = message.body
    })

    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    await sut.authenticate(schoolPin, pupilPin)
    expect(messageDispatchMock.dispatch).toHaveBeenCalledTimes(1)
    expect(actualMessage.checkCode).toBe(expectedPayload.checkCode)
    expect(actualMessage.practice).toBe(expectedPayload.config.practice)
    expect(actualMessage.version).toBe(1)
    expect(actualMessage.loginAt).toBeDefined()
  })
})
