/* global describe expect beforeEach test jest afterEach */

const sasTokenService = require('../../../services/sas-token.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const redisKeyService = require('../../../services/redis-key.service')
const queueNameService = require('../../../services/storage-queue-name-service')
const sasTokenDataService = require('../../../services/data-access/queue-sas-token.data.service')
const moment = require('moment')
const sut = sasTokenService
const logger = require('../../../services/log.service').getLogger()

describe('sas-token.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('generateSasToken', () => {
    const queueName = 'some-queue'
    const expiryDate = moment().add(1, 'hour')

    describe('without redis', () => {
      beforeEach(() => {
        jest.spyOn(redisCacheService, 'get').mockResolvedValue()
        jest.spyOn(redisCacheService, 'set').mockResolvedValue()
      })

      test('throws an error if the expiryDate is not provided', async () => {
        await expect(sasTokenService.generateSasToken(queueName, null))
          .rejects
          .toThrow('Invalid expiryDate')
      })

      test('throws an error if the expiryDate is not a moment object', async () => {
        await expect(sasTokenService.generateSasToken(queueName, { object: 'yes' }))
          .rejects
          .toThrow('Invalid expiryDate')
      })

      test('throws an error if the expiryDate is not a moment object', async () => {
        await expect(sasTokenService.generateSasToken(queueName, new Date()))
          .rejects
          .toThrow('Invalid expiryDate')
      })

      test('sets the start Date to more than 4.5 minutes in the past', async () => {
        let capturedStartDate
        jest.spyOn(sasTokenDataService, 'generateSasTokenWithPublishOnly').mockImplementation((q, start, expiry) => {
          capturedStartDate = start
          return 'some/url?query=foo'
        })
        await sasTokenService.generateSasToken(queueName, expiryDate)
        const fourAndAHalfMinutesAgo = moment().subtract(1, 'minutes').subtract(30, 'seconds')
        const lessThanFourAndAHalfMinutesAgo = moment(capturedStartDate).isBefore(fourAndAHalfMinutesAgo)
        expect(lessThanFourAndAHalfMinutesAgo).toBe(true)
      })

      test('it generates the SAS token', async () => {
        jest.spyOn(sasTokenDataService, 'generateSasTokenWithPublishOnly').mockImplementation(() => {
          return 'some/url?query=foo'
        })
        const res = await sasTokenService.generateSasToken(queueName, expiryDate)
        expect(sasTokenDataService.generateSasTokenWithPublishOnly).toHaveBeenCalled()
        expect({}.hasOwnProperty.call(res, 'token')).toBe(true)
        expect({}.hasOwnProperty.call(res, 'url')).toBe(true)
        expect({}.hasOwnProperty.call(res, 'queueName')).toBe(true)
      })

      test('makes a call to redis to try and fetch the cached token', async () => {
        jest.spyOn(sasTokenDataService, 'generateSasTokenWithPublishOnly').mockReturnValue('url?queryString')
        await sasTokenService.generateSasToken(queueName, expiryDate)
        expect(redisCacheService.get).toHaveBeenCalled()
      })

      test('makes a call to redis to cache the token', async () => {
        jest.spyOn(sasTokenDataService, 'generateSasTokenWithPublishOnly').mockReturnValue('some/url?query=foo')
        const res = await sasTokenService.generateSasToken(queueName, expiryDate)
        const redisKey = redisKeyService.getSasTokenKey(queueName)
        const oneHourInSeconds = 1 * 60 * 60
        expect(redisCacheService.set).toHaveBeenCalledWith(redisKey, res, oneHourInSeconds)
      })
    })

    describe('with redis', () => {
      beforeEach(() => {
        jest.spyOn(redisCacheService, 'get').mockResolvedValue('a test token')
        jest.spyOn(redisCacheService, 'set').mockResolvedValue()
      })

      test('short-circuits when the token is found in cache', async () => {
        const res = await sasTokenService.generateSasToken(queueName, expiryDate)
        expect(res).toBe('a test token')
        expect(redisCacheService.get).toHaveBeenCalled()
        expect(redisCacheService.set).not.toHaveBeenCalled()
      })
    })
  })

  describe('getTokens', () => {
    test('calls redis once to retrieve all the tokens', async () => {
      // mock a response where the values are found in the cache
      const mockRedisResponse = [
        { queueName: queueNameService.NAMES.CHECK_STARTED, token: 'aaa' },
        { queueName: queueNameService.NAMES.PUPIL_PREFS, token: 'aab' },
        { queueName: queueNameService.NAMES.CHECK_SUBMIT, token: 'aab' }
      ]
      jest.spyOn(redisCacheService, 'getMany').mockResolvedValue(mockRedisResponse)
      jest.spyOn(sasTokenService, 'generateSasToken').mockImplementation()
      await sut.getTokens(true, moment().add(4, 'hours'))
      expect(redisCacheService.getMany).toHaveBeenCalledTimes(1)
      expect(sasTokenService.generateSasToken).not.toHaveBeenCalled()
    })

    test('calls out to generate sas tokens if not found in redis', async () => {
      // mock a response where the values are not found in the cache
      const mockRedisResponse = [
        undefined,
        undefined,
        undefined,
        undefined
      ]
      jest.spyOn(redisCacheService, 'getMany').mockResolvedValue(mockRedisResponse)
      jest.spyOn(sasTokenService, 'generateSasToken').mockImplementation(function (queueName) {
        return {
          queueName,
          token: 'test token',
          url: 'test url'
        }
      })
      // quieten the log
      jest.spyOn(logger, 'debug').mockImplementation()
      await sut.getTokens(true, moment().add(4, 'hours'))
      expect(redisCacheService.getMany).toHaveBeenCalledTimes(1)
      expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(2)
    })

    test('calls out to generate sas tokens if any are not found in redis', async () => {
      // mock a response where the values are partially found in the cache
      const mockRedisResponse = [
        { queueName: queueNameService.NAMES.CHECK_STARTED, token: 'aaa' },
        undefined
      ]
      jest.spyOn(redisCacheService, 'getMany').mockReturnValue(mockRedisResponse)
      jest.spyOn(sasTokenService, 'generateSasToken').mockImplementation(function (queueName) {
        return {
          queueName,
          token: 'test token',
          url: 'test url'
        }
      })
      jest.spyOn(logger, 'debug').mockImplementation()
      const res = await sut.getTokens(true, moment().add(4, 'hours'))
      expect(redisCacheService.getMany).toHaveBeenCalledTimes(1)
      expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(1)
      // Expect `res` to have 4 properties, 2 from redis, and 2 generated
      expect(Object.keys(res).length).toBe(2)
    })
  })
})
