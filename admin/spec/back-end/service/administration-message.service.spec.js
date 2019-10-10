'use strict'

/* global describe, it, expect spyOn */
const redisCacheService = require('../../../services/redis-cache.service')
const administrationMessageService = require('../../../services/administration-message.service')

describe('administrationMessageService', () => {
  describe('getMessage', () => {
    it('should call redisCacheService.get', async () => {
      spyOn(redisCacheService, 'get').and.returnValues(JSON.stringify({}))
      await administrationMessageService.getMessage()
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
