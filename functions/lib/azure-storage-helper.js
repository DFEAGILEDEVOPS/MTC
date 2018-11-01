'use strict'

const azureStorage = require('azure-storage')
const bluebird = require('bluebird')

const preparedCheckTable = 'preparedCheck'
let azureTableService
let azureQueueService

const azureStorageHelper = {
  deleteFromPreparedCheckTableStorage: async function deleteFromPreparedCheckTableStorage (azureTableService, checkCode, logger) {
    const query = new azureStorage.TableQuery()
      .top(1)
      .where('checkCode eq ?', checkCode)

    let check
    try {
      const data = await azureTableService.queryEntitiesAsync(preparedCheckTable, query, null)
      check = data.response.body.value[0]
    } catch (error) {
      const msg = `deleteFromPreparedCheckTableStorage(): error during retrieve for table storage check for checkCode [${checkCode}]`
      logger.error(msg)
      logger.error(error.message)
      throw new Error(msg)
    }

    if (!check) {
      const msg = `deleteFromPreparedCheckTableStorage(): check does not exist: [${checkCode}]`
      logger.info(msg)
      const error = new Error(msg)
      error.type = 'NOT_FOUND'
      throw error
    }

    const entity = {
      PartitionKey: check.PartitionKey,
      RowKey: check.RowKey
    }

    // Delete the prepared check so the pupil cannot login again
    try {
      const res = await azureTableService.deleteEntityAsync(preparedCheckTable, entity)
      if (!(res && res.result && res.result.isSuccessful === true)) {
        throw new Error('deleteFromPreparedCheckTableStorage(): bad result from deleteEntity')
      }
    } catch (error) {
      const msg = `deleteFromPreparedCheckTableStorage(): failed to delete prepared check for checkCode: [${checkCode}]`
      logger.error(msg)
      logger.error(error.message)
      throw error
    }
  },

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
  getPromisifiedAzureQueueService: function getPromisifiedAzureQueueService ()  {
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

  addMessageToQueue: async function addMessageToQueue (queueName, messageData) {
    const azureQueueService = this.getPromisifiedAzureQueueService()
    const message = JSON.stringify(messageData)
    const encodedMessage = Buffer.from(message).toString('base64')
    return azureQueueService.createMessageAsync(queueName, encodedMessage)
  }
}

module.exports = azureStorageHelper
