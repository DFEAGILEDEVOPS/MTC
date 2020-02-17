/* global describe expect beforeEach jest fail it spyOn */

const sasTokenService = require('../../../services/sas-token.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const redisKeyService = require('../../../services/redis-key.service')
const queueNameService = require('../../../services/queue-name-service')
const moment = require('moment')
const sut = sasTokenService

describe('sas-token.service', () => {
  describe('generateSasToken', () => {
    const queueName = 'some-queue'
    const expiryDate = moment().add(1, 'hour')
    let queueServiceMock

    describe('without redis', () => {
      beforeEach(() => {
        queueServiceMock = {
          generateSharedAccessSignature: jest.fn(() => 'mock token'),
          getUrl: jest.fn(() => 'http://localhost/queue')
        }
        spyOn(redisCacheService, 'get').and.returnValue(Promise.resolve(undefined))
        spyOn(redisCacheService, 'set')
      })

      it('throws an error if the expiryDate is not provided', async () => {
        try {
          await sasTokenService.generateSasToken(queueName, null, queueServiceMock)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Invalid expiryDate')
        }
      })

      it('throws an error if the expiryDate is not a moment object', async () => {
        try {
          await sasTokenService.generateSasToken(queueName, { object: 'yes' }, queueServiceMock)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Invalid expiryDate')
        }
      })

      it('throws an error if the expiryDate is not a moment object', async () => {
        try {
          await sasTokenService.generateSasToken(queueName, new Date(), queueServiceMock)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Invalid expiryDate')
        }
      })

      it('sets the start Date to more than 4.5 minutes in the past', async () => {
        await sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
        const args = queueServiceMock.generateSharedAccessSignature.mock.calls[0]
        const fourAndAHalfMinutesAgo = moment().subtract(1, 'minutes').subtract(30, 'seconds')
        const lessThanFourAndAHalfMinutesAgo = moment(args[1].AccessPolicy.Start).isBefore(fourAndAHalfMinutesAgo)
        expect(lessThanFourAndAHalfMinutesAgo).toBe(true)
      })

      it('it generates the SAS token', async () => {
        const res = await sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
        expect(queueServiceMock.generateSharedAccessSignature).toHaveBeenCalled()
        expect(queueServiceMock.getUrl).toHaveBeenCalled()
        expect({}.hasOwnProperty.call(res, 'token')).toBe(true)
        expect({}.hasOwnProperty.call(res, 'url')).toBe(true)
        expect({}.hasOwnProperty.call(res, 'queueName')).toBe(true)
      })

      it('sets the permissions to add only', async () => {
        await sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
        const args = queueServiceMock.generateSharedAccessSignature.mock.calls[0]
        expect(args[1].AccessPolicy.Permissions).toBe('a')
      })

      it('makes a call to redis to fetch the cached token', async () => {
        await sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
        expect(redisCacheService.get).toHaveBeenCalled()
      })

      it('makes a call to redis to cache the token', async () => {
        const res = await sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
        const redisKey = redisKeyService.getSasTokenKey(queueName)
        const oneHourInSeconds = 1 * 60 * 60
        expect(redisCacheService.set).toHaveBeenCalledWith(redisKey, res, oneHourInSeconds)
      })
    })

    describe('with redis', () => {
      beforeEach(() => {
        queueServiceMock = {
          generateSharedAccessSignature: jest.fn(() => 'mock token'),
          getUrl: jest.fn(() => 'http://localhost/queue')
        }
        spyOn(redisCacheService, 'get').and.returnValue('a test token')
        spyOn(redisCacheService, 'set')
      })

      it('short-circuits when the token is found in cache', async () => {
        const res = await sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
        expect(res).toBe('a test token')
        expect(redisCacheService.get).toHaveBeenCalled()
        expect(redisCacheService.set).not.toHaveBeenCalled()
      })
    })
  })

  describe('getTokens', () => {
    it('calls redis once to retrieve all the tokens', async () => {
      // mock a response where the values are found in the cache
      const mockRedisResponse = [
        { queueName: queueNameService.NAMES.CHECK_STARTED, token: 'aaa' },
        { queueName: queueNameService.NAMES.PUPIL_PREFS, token: 'aab' },
        { queueName: queueNameService.NAMES.PUPIL_FEEDBACK, token: 'aab' },
        { queueName: queueNameService.NAMES.CHECK_SUBMIT, token: 'aab' }
      ]
      spyOn(redisCacheService, 'getMany').and.returnValue(mockRedisResponse)
      spyOn(sasTokenService, 'generateSasToken')
      await sut.getTokens(true, moment().add(4, 'hours'))
      expect(redisCacheService.getMany).toHaveBeenCalledTimes(1)
      expect(sasTokenService.generateSasToken).not.toHaveBeenCalled()
    })

    it('calls out to generate sas tokens if not found in redis', async () => {
      // mock a response where the values are not found in the cache
      const mockRedisResponse = [
        undefined,
        undefined,
        undefined,
        undefined
      ]
      spyOn(redisCacheService, 'getMany').and.returnValue(mockRedisResponse)
      spyOn(sasTokenService, 'generateSasToken').and.callFake(function (queueName) {
        console.log('call fake faked')
        return {
          queueName,
          token: 'test token',
          url: 'test url'
        }
      })
      await sut.getTokens(true, moment().add(4, 'hours'))
      expect(redisCacheService.getMany).toHaveBeenCalledTimes(1)
      expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(4)
    })

    it('calls out to generate sas tokens if any are not found in redis', async () => {
      // mock a response where the values are partially found in the cache
      const mockRedisResponse = [
        { queueName: queueNameService.NAMES.CHECK_STARTED, token: 'aaa' },
        { queueName: queueNameService.NAMES.PUPIL_PREFS, token: 'aab' },
        undefined,
        undefined
      ]
      spyOn(redisCacheService, 'getMany').and.returnValue(mockRedisResponse)
      spyOn(sasTokenService, 'generateSasToken').and.callFake(function (queueName) {
        console.log('call fake faked')
        return {
          queueName,
          token: 'test token',
          url: 'test url'
        }
      })
      const res = await sut.getTokens(true, moment().add(4, 'hours'))
      expect(redisCacheService.getMany).toHaveBeenCalledTimes(1)
      expect(sasTokenService.generateSasToken).toHaveBeenCalledTimes(2)
      // Expect `res` to have 4 properties, 2 from redis, and 2 generated
      expect(Object.keys(res).length).toBe(4)
    })

    it('does not return the check-submitted token for tio checks', async () => {
      // mock a response where the values are found in the cache
      const mockRedisResponse = [
        { queueName: queueNameService.NAMES.CHECK_STARTED, token: 'aaa' },
        { queueName: queueNameService.NAMES.PUPIL_PREFS, token: 'aab' },
        { queueName: queueNameService.NAMES.PUPIL_FEEDBACK, token: 'aab' }
      ]
      spyOn(redisCacheService, 'getMany').and.returnValue(mockRedisResponse)
      spyOn(sasTokenService, 'generateSasToken')
      const result = await sut.getTokens(false, moment().add(4, 'hours'))
      expect(redisCacheService.getMany).toHaveBeenCalledTimes(1)
      expect(sasTokenService.generateSasToken).not.toHaveBeenCalled()
      expect(Object.keys(result).length).toBe(3)
      expect(result[queueNameService.NAMES.CHECK_SUBMIT]).toBeUndefined()
    })
  })
})
