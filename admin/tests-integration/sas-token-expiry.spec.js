'use strict'
/* global describe, it, expect fail, afterAll beforeEach */

const moment = require('moment')

const redisKeyService = require('../services/redis-key.service')
const { QueueServiceClient } = require('@azure/storage-queue')
const queueNameService = require('../services/queue-name-service')
const sut = require('../services/sas-token.service')
const redisCacheService = require('../services/data-access/redis-cache.service')

const delay = (ms) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

describe('sas-token-expiry', () => {
  beforeEach(async () => {
    const queueKey = redisKeyService.getSasTokenKey(queueNameService.NAMES.CHECK_SUBMIT)
    await redisCacheService.drop(queueKey)
  })
  afterAll(async () => { await redisCacheService.disconnect() })

  it('should send a message successfully with valid token', async () => {
    const sasExpiryDate = moment().add(1, 'minute')
    const checkCompleteSasToken = await sut.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
      sasExpiryDate
    )
    let queueServiceUrl
    try {
      queueServiceUrl = checkCompleteSasToken.token.replace(`/${queueNameService.NAMES.CHECK_SUBMIT}`, '')
      const queueServiceClient = new QueueServiceClient(queueServiceUrl)
      const queueClient = queueServiceClient.getQueueClient(queueNameService.NAMES.CHECK_SUBMIT)
      await queueClient.sendMessage('message')
    } catch (error) {
      fail(`${error.message}\n connection Url: ${queueServiceUrl}`)
    }
  })

  it('should return specific properties and content when attempting to submit with expired sas tokens', async () => {
    const sasExpiryDate = moment().add(2, 'seconds')
    const checkCompleteSasToken = await sut.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
      sasExpiryDate
    )
    try {
      const queueServiceUrl = checkCompleteSasToken.token.replace(`/${queueNameService.NAMES.CHECK_SUBMIT}`, '')
      const queueServiceClient = new QueueServiceClient(queueServiceUrl)
      await delay(3000)
      const queueClient = queueServiceClient.getQueueClient(queueNameService.NAMES.CHECK_SUBMIT)
      await queueClient.sendMessage('testing message expiry in /admin/tests-integration/sas-token-expiry.spec.js')
      fail('message should have been rejected due to expired token')
    } catch (error) {
      expect(error.statusCode).toBe(403)
    }
  })
})
