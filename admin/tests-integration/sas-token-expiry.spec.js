'use strict'
/* global describe, it, expect fail */

const azureStorage = require('azure-storage')
const bluebird = require('bluebird')
const moment = require('moment')

const queueNameService = require('../services/queue-name-service')
const sasTokenService = require('../services/sas-token.service')

const delay = (ms) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

let queueService

const createQueueService = async (sasToken) => {
  queueService = await azureStorage.createQueueServiceWithSas(
    sasToken.url.replace(queueNameService.NAMES.CHECK_COMPLETE, ''), sasToken.token
  )

  bluebird.promisifyAll(queueService, {
    promisifier: (originalFunction) => function (...args) {
      return new Promise((resolve, reject) => {
        try {
          originalFunction.call(this, ...args, (error, result, response) => {
            if (error) {
              return reject(error)
            }
            return resolve(result)
          })
        } catch (error) {
          return reject(error)
        }
      })
    }
  })
}

describe('sas-token-expiry', () => {
  it('should return specific properties and content when attempting to submit with expired sas tokens', async () => {
    const sasExpiryDate = moment().add(2, 'seconds')
    const checkCompleteSasToken = sasTokenService.generateSasToken(
      queueNameService.NAMES.CHECK_COMPLETE,
      sasExpiryDate
    )
    try {
      await createQueueService(checkCompleteSasToken)
      await delay(3000)
      await queueService.createMessageAsync(queueNameService.NAMES.CHECK_COMPLETE, 'message')
      fail()
    } catch (error) {
      expect(error.statusCode).toBe(403)
      expect(error.authenticationerrordetail.includes('Signature not valid in the specified time frame')).toBeTruthy()
    }
  })
})
