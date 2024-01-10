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
  return `${token.url.replace(`/${queueNameService.NAMES.CHECK_SUBMIT}`, '')}?${token.token}`
}

describe('sas-token-expiry', () => {
  beforeEach(async () => {
    const queueKey = redisKeyService.getSasTokenKey(queueNameService.NAMES.CHECK_SUBMIT)
    await redisCacheService.drop(queueKey)
  })
  afterAll(async () => { await redisCacheService.disconnect() })

  test('should send a message successfully with valid token', async () => {
    const sasExpiryDate = moment().add(1, 'minute')
    const checkSubmitToken = await sut.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
      sasExpiryDate
    )
    let queueServiceUrl
    try {
      // queueServiceUrl = checkSubmitToken.token.replace(`/${queueNameService.NAMES.CHECK_SUBMIT}`, '')
      queueServiceUrl = getFullUrl(checkSubmitToken)
      const queueServiceClient = new QueueServiceClient(queueServiceUrl)
      const queueClient = queueServiceClient.getQueueClient(queueNameService.NAMES.CHECK_SUBMIT)
      await queueClient.sendMessage('message')
    } catch (error) {
      fail(`${error.message}\n connection Url: ${queueServiceUrl}`)
    }
  })

  test('should return specific properties and content when attempting to submit with expired sas tokens', async () => {
    const sasExpiryDate = moment().add(2, 'seconds')
    const checkSubmitToken = await sut.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
      sasExpiryDate
    )
    try {
      const queueServiceUrl = getFullUrl(checkSubmitToken)
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
