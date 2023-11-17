import moment from 'moment'
import type { IPupilLoginMessage } from './redis-pupil-auth.service'
import { RedisPupilAuthenticationService } from './redis-pupil-auth.service'
import type { IRedisService } from './redis.service'
import type { IServiceBusQueueService } from '../../azure/service-bus.queue.service'

let sut: RedisPupilAuthenticationService
let redisServiceMock: IRedisService
let messageDispatchMock: IServiceBusQueueService

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn(),
  drop: jest.fn(),
  quit: jest.fn(),
  ttl: jest.fn(),
  expire: jest.fn()
}))

const MessageDispatchMock = jest.fn<IServiceBusQueueService, any>(() => ({
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
    let actualKey: string = ''
    jest.spyOn(redisServiceMock, 'get').mockImplementation(async (key: string) => {
      actualKey = key
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    const expectedKey = `preparedCheck:${schoolPin}:${pupilPin}`
    await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(actualKey).toStrictEqual(expectedKey)
  })

  test('an error should be thrown if schoolPin is not provided', async () => {
    let schoolPin
    const pupilPin = '1234'
    const buildNumber = '1-2-3'
    try {
      await sut.authenticate(schoolPin, pupilPin, buildNumber)
      fail('expected error to be thrown')
    } catch (error: any) {
      expect(error.message).toBe('schoolPin is required')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })

  test('an error should be thrown if schoolPin is an empty string', async () => {
    const schoolPin = ''
    const pupilPin = '1234'
    const buildNumber = '1-2-3'
    try {
      await sut.authenticate(schoolPin, pupilPin, buildNumber)
      fail('expected error to be thrown')
    } catch (error: any) {
      expect(error.message).toBe('schoolPin is required')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })

  test('an error should be thrown if pupilPin is not provided', async () => {
    const schoolPin = 'abc'
    const pupilPin = undefined
    const buildNumber = '1-2-3'
    try {
      await sut.authenticate(schoolPin, pupilPin, buildNumber)
      fail('expected error to be thrown')
    } catch (error: any) {
      expect(error.message).toBe('pupilPin is required')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })

  test('an error should be thrown if pupilPin is an empty string', async () => {
    const schoolPin = 'abc'
    const pupilPin = ''
    const buildNumber = '1-2-3'
    try {
      await sut.authenticate(schoolPin, pupilPin, buildNumber)
      fail('expected error to be thrown')
    } catch (error: any) {
      expect(error.message).toBe('pupilPin is required')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })

  test('an error should be thrown if buildVersion is an empty string', async () => {
    const schoolPin = 'abc'
    const pupilPin = '1234'
    const buildNumber = ''
    try {
      await sut.authenticate(schoolPin, pupilPin, buildNumber)
      fail('expected error to be thrown')
    } catch (error: any) {
      expect(error.message).toBe('buildVersion is required')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })

  test('an error should be thrown if buildVersion is not provided', async () => {
    const schoolPin = 'abc'
    const pupilPin = '1234'
    const buildNumber = undefined
    try {
      await sut.authenticate(schoolPin, pupilPin, buildNumber)
      fail('expected error to be thrown')
    } catch (error: any) {
      expect(error.message).toBe('buildVersion is required')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })

  test('the check payload should be returned if item found in cache and the pin is valid', async () => {
    const pinValidFromUtc = moment().startOf('day')
    const pinExpiresAtUtc = moment().endOf('day')
    const expectedPayload = {
      checkCode: '1111-2222-AAAA-4444',
      config: {
        practice: true
      },
      pinValidFromUtc,
      pinExpiresAtUtc
    }
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    const payload = await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(payload).toStrictEqual(expectedPayload)
  })

  test('authorisation is denied if the pin is not yet valid', async () => {
    const pinValidFromUtc = moment().add(1, 'hour')
    const pinExpiresAtUtc = moment().add(2, 'hour')
    const expectedPayload = {
      checkCode: '1111-2222-AAAA-4444',
      config: {
        practice: false
      },
      pinValidFromUtc,
      pinExpiresAtUtc
    }
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    const payload = await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(payload).toBeUndefined()
  })

  test('authorisation is denied if the pin was valid in the past', async () => {
    const pinValidFromUtc = moment().subtract(2, 'hour')
    const pinExpiresAtUtc = moment().subtract(1, 'hour')
    const expectedPayload = {
      checkCode: '1111-2222-AAAA-4444',
      config: {
        practice: false
      },
      pinValidFromUtc,
      pinExpiresAtUtc
    }
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    const payload = await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(payload).toBeUndefined()
  })

  test('null should be returned if item not found in cache', async () => {
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(undefined)
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    const payload = await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(payload).toBeUndefined()
  })

  test('redis item TTL should be set to 30 minutes from now if config.practice is defined and false', async () => {
    const thirtyMinutesInSeconds = 1800
    const expectedPayload = {
      checkCode: '1111-2222-AAAA-4444',
      pinExpiresAtUtc: moment.utc().add(1, 'hour'), // valid
      pinValidFromUtc: moment.utc().subtract(1, 'hour'), // valid
      config: {
        practice: false
      }
    }
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    let actualPreparedCheckExpiryValue: number = -1
    jest.spyOn(redisServiceMock, 'expire').mockImplementation(async (key: string, ttl: number) => {
      actualPreparedCheckExpiryValue = ttl
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(actualPreparedCheckExpiryValue).toStrictEqual(thirtyMinutesInSeconds)
  })

  test('no redis expiry is set if config.practice is true', async () => {
    const expectedPayload = {
      checkCode: '1111-2222-AAAA-4444',
      pinExpiresAtUtc: moment.utc().add(1, 'hour'), // valid
      pinValidFromUtc: moment.utc().subtract(1, 'hour'), // valid
      config: {
        practice: true
      }
    }
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    jest.spyOn(redisServiceMock, 'setex')
    jest.spyOn(redisServiceMock, 'expire')
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(redisServiceMock.expire).not.toHaveBeenCalled()
  })

  test('no redis expiry is set if config.practice does not exist', async () => {
    const expectedPayload = {
      checkCode: '1111-2222-AAAA-4444',
      pinExpiresAtUtc: moment.utc().add(1, 'hour'), // valid
      pinValidFromUtc: moment.utc().subtract(1, 'hour'), // valid
      config: {}
    }

    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    jest.spyOn(redisServiceMock, 'setex')
    jest.spyOn(redisServiceMock, 'expire')
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(redisServiceMock.expire).not.toHaveBeenCalled()
  })

  test('no redis expiry is set if config.practice is undefined', async () => {
    const expectedPayload = {
      checkCode: '1111-2222-AAAA-4444',
      pinExpiresAtUtc: moment.utc().add(1, 'hour'), // valid
      pinValidFromUtc: moment.utc().subtract(1, 'hour'), // valid
      config: {
        practice: undefined
      }
    }
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    jest.spyOn(redisServiceMock, 'setex')
    jest.spyOn(redisServiceMock, 'expire')
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(redisServiceMock.expire).not.toHaveBeenCalled()
  })

  test('pupil-login message should be dispatched upon successful authentication', async () => {
    const expectedPayload = {
      checkCode: 'check-code',
      pinExpiresAtUtc: moment.utc().add(1, 'hour'), // valid
      pinValidFromUtc: moment.utc().subtract(1, 'hour'), // valid
      config: {
        practice: true
      }
    }
    jest.spyOn(redisServiceMock, 'get').mockResolvedValue(expectedPayload)
    // Define `actualMessage` here as TS absolutely does not believe this message get assigned before test.
    let actualMessage: IPupilLoginMessage = {
      checkCode: '',
      loginAt: new Date(1970),
      practice: true,
      version: -1,
      clientBuildVersion: '1.2',
      apiBuildVersion: '1.2'
    }
    jest.spyOn(messageDispatchMock, 'dispatch').mockImplementation(async (message) => {
      actualMessage = message.body
    })
    const schoolPin = 'abc12def'
    const pupilPin = '5678'
    const buildNumber = '1-2-3'
    await sut.authenticate(schoolPin, pupilPin, buildNumber)
    expect(messageDispatchMock.dispatch).toHaveBeenCalledTimes(1)
    expect(actualMessage.checkCode).toBe(expectedPayload.checkCode)
    expect(actualMessage.practice).toBe(expectedPayload.config.practice)
    expect(actualMessage.version).toBe(1)
    expect(actualMessage.loginAt).toBeDefined()
  })
})
