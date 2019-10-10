'use strict'

/* global describe, it, expect spyOn fail */
const redisCacheService = require('../../../services/redis-cache.service')
const administrationMessageService = require('../../../services/administration-message.service')

describe('administrationMessageService', () => {
  describe('getMessage', () => {
    it('should call redisCacheService.get', async () => {
      spyOn(redisCacheService, 'get').and.returnValues(JSON.stringify({}))
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
    })
    it('should throw an error if redisCacheService.get does not return a JSON', async () => {
      spyOn(redisCacheService, 'get').and.returnValues(undefined)
      try {
        await administrationMessageService.getMessage()
        fail()
      } catch (err) {
        expect(err.message).toBe('Unexpected token u in JSON at position 0')
      }
      expect(redisCacheService.get).toHaveBeenCalled()
    })
  })
  describe('setMessage', () => {
    it('should call redisCacheService.set', async () => {
      spyOn(redisCacheService, 'set')
      const serviceMessageTitle = 'serviceMessageTitle'
      const serviceMessageContent = 'serviceMessageContent'
      await administrationMessageService.setMessage(serviceMessageTitle, serviceMessageContent)
      expect(redisCacheService.set).toHaveBeenCalled()
    })
  })
  describe('dropMessage', () => {
    it('should call redisCacheService.drop', async () => {
      spyOn(redisCacheService, 'drop')
      await administrationMessageService.dropMessage()
      expect(redisCacheService.drop).toHaveBeenCalled()
    })
  })
})
