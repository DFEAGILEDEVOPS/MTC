'use strict'
/* global describe, it, expect fail, afterAll */

const moment = require('moment')

const { QueueServiceClient } = require('@azure/storage-queue')
const queueNameService = require('../services/queue-name-service')
const sasTokenService = require('../services/sas-token.service')
const redisCacheService = require('../services/data-access/redis-cache.service')

const delay = (ms) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

let queueService

const createQueueService = async (sasToken) => {
  return new QueueServiceClient(sasToken.url, sasToken.token)
}

describe('sas-token-expiry', () => {
  afterAll(async () => { await redisCacheService.disconnect() })

  it('should return specific properties and content when attempting to submit with expired sas tokens', async () => {
    const sasExpiryDate = moment().add(2, 'seconds')
    const checkCompleteSasToken = await sasTokenService.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
      sasExpiryDate
    )
    try {
      await createQueueService(checkCompleteSasToken)
      await delay(3000)
      await queueService.createMessageAsync(queueNameService.NAMES.CHECK_SUBMIT, 'message')
      fail()
    } catch (error) {
      expect(error.statusCode).toBe(403)
      expect(error.authenticationerrordetail.includes('Signature not valid in the specified time frame')).toBeTruthy()
    }
  })
})
