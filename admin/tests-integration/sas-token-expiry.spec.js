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

describe('sas-token-expiry', () => {
  afterAll(async () => { await redisCacheService.disconnect() })

  it('should send a message successfully with valid token', async () => {
    const sasExpiryDate = moment().add(20, 'seconds')
    const checkCompleteSasToken = await sasTokenService.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
      sasExpiryDate
    )
    try {
      console.dir(checkCompleteSasToken)
      const queueServiceClient = new QueueServiceClient(checkCompleteSasToken.token.replace(`/${queueNameService.NAMES.CHECK_SUBMIT}`, ''))
      const queueClient = queueServiceClient.getQueueClient(queueNameService.NAMES.CHECK_SUBMIT)
      await queueClient.sendMessage('message')
    } catch (error) {
      fail(error.message)
    }
  })

  it('should return specific properties and content when attempting to submit with expired sas tokens', async () => {
    const sasExpiryDate = moment().add(2, 'seconds')
    const checkCompleteSasToken = await sasTokenService.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
      sasExpiryDate
    )
    try {
      console.log('getting service client')
      const queueServiceClient = new QueueServiceClient(checkCompleteSasToken.token)
      console.log('wait 3 seconds')
      await delay(3000)
      console.log('getting queue client')
      const queueClient = queueServiceClient.getQueueClient(queueNameService.NAMES.CHECK_SUBMIT)
      console.log('sending message')
      await queueClient.sendMessage('message')
      fail()
    } catch (error) {
      expect(error.statusCode).toBe(401)
      console.dir(error)
      // expect(error.authenticationerrordetail.includes('Signature not valid in the specified time frame')).toBeTruthy()
    }
  })
})
