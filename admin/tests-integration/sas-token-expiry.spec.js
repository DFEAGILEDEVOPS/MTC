'use strict'
/* global describe test expect afterAll beforeEach */

const moment = require('moment')
const redisKeyService = require('../services/redis-key.service')
const queueNameService = require('../services/storage-queue-name-service')
const sut = require('../services/sas-token.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const axios = require('axios')

const delay = (ms) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

async function postMessageToQueue (payload, queueUrl, sasTokenUrl) {
  const messagePostUrl = `${queueUrl}/messages?messagettl=60&${sasTokenUrl}`
  const stringifiedPayload = JSON.stringify(payload)
  const encodedMessage = Buffer.from(stringifiedPayload, 'utf8').toString('base64')
  const wrappedXmlMessage = `<?xml version="1.0" encoding="utf-8"?>
                              <QueueMessage><MessageText>${encodedMessage}</MessageText></QueueMessage>`
  const config = {
    headers: {
      'Content-Type': 'application/xml',
      Accept: 'application/xml, text/xml',
      'x-ms-date': (new Date()).toISOString()
    },
    method: 'POST'
  }
  const response = await axios.post(messagePostUrl, wrappedXmlMessage, config)
  return response.data
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
    const message = { message: 'integration test message' }
    await postMessageToQueue(message, sasToken.url, sasToken.token)
  })

  test('should return specific properties and content when attempting to submit with expired sas tokens', async () => {
    const sasExpiryDate = moment().add(2, 'seconds')
    const sasToken = await sut.generateSasToken(
      queueNameService.NAMES.PUPIL_FEEDBACK,
      sasExpiryDate
    )
    try {
      await delay(3000)
      const message = {
        message: 'integration test message'
      }
      await postMessageToQueue(message, sasToken.url, sasToken.token)
      throw new Error('message should have been rejected due to expired token')
    } catch (error) {
      expect(error.status).toBe(403)
    }
  })
})
