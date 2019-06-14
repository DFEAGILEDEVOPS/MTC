'use strict'

require('dotenv').config()
const azureStorage = require('azure-storage')
const bluebird = require('bluebird')

let azureTableService
let azureQueueService
let azureBlobService

const azureStorageHelper = {
  /**
   * Promisify and cache the azureTableService library as it still lacks Promise support
   */
  getPromisifiedAzureTableService: function getPromisifiedAzureTableService () {
    if (azureTableService) {
      return azureTableService
    }
    azureTableService = azureStorage.createTableService()
    bluebird.promisifyAll(azureTableService, {
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

    return azureTableService
  },

  /**
   * Promisify the azureQueueService
   * @return {*}
   */
  getPromisifiedAzureQueueService: function getPromisifiedAzureQueueService () {
    if (azureQueueService) {
      return azureQueueService
    }
    azureQueueService = azureStorage.createQueueService()
    bluebird.promisifyAll(azureQueueService, {
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

    return azureQueueService
  },

  /**
   * Promisify the azureBlobService
   * @return {*}
   */
  getPromisifiedAzureBlobService: function getPromisifiedAzureBlobService () {
    if (azureBlobService) {
      return azureBlobService
    }
    azureBlobService = azureStorage.createBlobService()
    bluebird.promisifyAll(azureBlobService, {
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

    return azureBlobService
  },

  /**
   * Add a message to an Azure Queue
   * @param queueName
   * @param messageData
   * @return {Promise<*>}
   */
  addMessageToQueue: async function addMessageToQueue (queueName, messageData) {
    const azureQueueService = this.getPromisifiedAzureQueueService()
    const message = JSON.stringify(messageData)
    const encodedMessage = Buffer.from(message).toString('base64')
    return azureQueueService.createMessageAsync(queueName, encodedMessage)
  }
}

module.exports = azureStorageHelper
