'use strict'
/* global describe test expect fail afterAll beforeEach */

const moment = require('moment')

const redisKeyService = require('../services/redis-key.service')
const { QueueServiceClient } = require('@azure/storage-queue')
const queueNameService = require('../services/storage-queue-name-service')
const sut = require('../services/sas-token.service')
const redisCacheService = require('../services/data-access/redis-cache.service')

const delay = (ms) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

const getFullUrl = (token) => {
  return `${token.url.replace(`/${queueNameService.NAMES.PUPIL_FEEDBACK}`, '')}?${token.token}`
}

describe('sas-token-expiry', () => {
  beforeEach(async () => {
    const queueKey = redisKeyService.getSasTokenKey(queueNameService.NAMES.PUPIL_FEEDBACK)
    await redisCacheService.drop(queueKey)
  })
  afterAll(async () => { await redisCacheService.disconnect() })

  test('should send a message successfully with valid token', async () => {
    const sasExpiryDate = moment().add(1, 'minute')
    const sasToken = await sut.generateSasToken(
      queueNameService.NAMES.PUPIL_FEEDBACK,
      sasExpiryDate
    )
    const queueServiceUrl = getFullUrl(sasToken)
    const queueServiceClient = new QueueServiceClient(queueServiceUrl)
    const queueClient = queueServiceClient.getQueueClient(queueNameService.NAMES.PUPIL_FEEDBACK)
    await queueClient.sendMessage('message')
  })

  test('should return specific properties and content when attempting to submit with expired sas tokens', async () => {
    const sasExpiryDate = moment().add(2, 'seconds')
    const sasToken = await sut.generateSasToken(
      queueNameService.NAMES.PUPIL_FEEDBACK,
      sasExpiryDate
    )
    try {
      const queueServiceUrl = getFullUrl(sasToken)
      const queueServiceClient = new QueueServiceClient(queueServiceUrl)
      await delay(3000)
      const queueClient = queueServiceClient.getQueueClient(queueNameService.NAMES.PUPIL_FEEDBACK)
      await queueClient.sendMessage('message 1')
      fail('message should have been rejected due to expired token')
    } catch (error) {
      console.log(error.message)
      expect(error.statusCode).toBe(403)
    }
  })
})
