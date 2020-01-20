'use strict'

const azure = require('azure-storage')

const bluebird = require('bluebird')
const logger = require('./log.service').getLogger()
let azureQueueService // cache the queueService for repeated use
let azureQueueServiceAsync // cache an async version

// TODO : delete this service from admin
const service = {
  addMessage: function addMessage (queueName, payload, queueService) {
    if (queueName === null || queueName.length < 1) {
      throw new Error('Missing queueName')
    }

    if (!queueService) {
      // If we have not been provided with a queueService, assume we want an Azure one.
      if (!azureQueueService) {
        azureQueueService = azure.createQueueService()
      }
      queueService = azureQueueService
    }

    const message = JSON.stringify(payload)
    const encodedMessage = Buffer.from(message).toString('base64')
    queueService.createMessage(queueName, encodedMessage, function (error, result, response) {
      if (error) {
        logger.error(`Error injecting message into queue [${queueName}]: ${error.message}`)
        logger.error(error)
      }
    })
  },

  /**
   * Promisify the azureQueueService
   * @return {*}
   */
  getPromisifiedAzureQueueService: function getPromisifiedAzureQueueService () {
    if (azureQueueServiceAsync) {
      return azureQueueServiceAsync
    }
    azureQueueServiceAsync = azure.createQueueService()
    bluebird.promisifyAll(azureQueueServiceAsync, {
      promisifier: (originalFunction) => function (...args) {
        return new Promise((resolve, reject) => {
          try {
            originalFunction.call(this, ...args, (error, result, response) => {
              if (error) {
                return reject(error)
              }
              resolve({ result, response })
            })
          } catch (error) {
            reject(error)
          }
        })
      }
    })

    return azureQueueServiceAsync
  },

  addMessageAsync: async function addMessageAsync (queueName, payload, queueService) {
    if (queueName === null || queueName.length < 1) {
      throw new Error('Missing queueName')
    }

    if (!queueService) {
      // If we have not been provided with a queueService, assume we want an Azure one.
      if (!azureQueueServiceAsync) {
        azureQueueServiceAsync = this.getPromisifiedAzureQueueService()
      }
      queueService = azureQueueServiceAsync
    }

    const message = JSON.stringify(payload)
    const encodedMessage = Buffer.from(message).toString('base64')
    try {
      await queueService.createMessageAsync(queueName, encodedMessage)
    } catch (error) {
      logger.error(`Error injecting message into queue [${queueName}]: ${error.message}`)
      logger.error(error)
      throw error
    }
  }
}

module.exports = service
