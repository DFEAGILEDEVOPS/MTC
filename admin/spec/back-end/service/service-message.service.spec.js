'use strict'

/* global describe, it, expect spyOn */
const redisCacheService = require('../../../services/redis-cache.service')
const serviceMessageService = require('../../../services/service-message.service')

describe('serviceMessageService', () => {
  describe('getMessage', () => {
    it('should call redisCacheService.get', async () => {
      spyOn(redisCacheService, 'get').and.returnValues(JSON.stringify({}))
      await serviceMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
    })
  })
  describe('setMessage', () => {
    it('should call redisCacheService.set', async () => {
      spyOn(redisCacheService, 'set')
      const serviceMessageTitle = 'serviceMessageTitle'
      const serviceMessageContent = 'serviceMessageContent'
      await serviceMessageService.setMessage(serviceMessageTitle, serviceMessageContent)
      expect(redisCacheService.set).toHaveBeenCalled()
    })
  })
})
