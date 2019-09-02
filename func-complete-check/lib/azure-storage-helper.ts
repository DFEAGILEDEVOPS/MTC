'use strict'

require('dotenv').config()
const azureStorage = require('azure-storage')
const QueryComparisons = azureStorage.TableUtilities.QueryComparisons
const TableQuery = azureStorage.TableQuery
const bluebird = require('bluebird')
const R = require('ramda')

const preparedCheckTable = 'preparedCheck'
let azureTableService
let azureQueueService
let azureBlobService

const azureStorageHelper = {
  getFromPreparedCheckTableStorage: async function getFromPreparedCheckTableStorage (azureTableService, checkCode, logger) {
    const query = new azureStorage.TableQuery()
      .top(1)
      .where(TableQuery.guidFilter('checkCode', QueryComparisons.EQUAL, checkCode))

    let check
    try {
      const data = await azureTableService.queryEntitiesAsync(preparedCheckTable, query, null)
      check = data.response.body.value[0]
    } catch (error) {
      const msg = `getFromPreparedCheckTableStorage(): error during retrieve for table storage check for checkCode [${checkCode}]`
      logger.error(msg)
      logger.error(error.message)
      throw new Error(msg)
    }

    if (!check) {
      const msg = `getFromPreparedCheckTableStorage(): check does not exist: [${checkCode}]`
      logger.info(msg)
      const error = new Error(msg)
      //@ts-ignore
      error.type = 'NOT_FOUND'
      throw error
    }
    return check
  },

  deleteFromPreparedCheckTableStorage: async function deleteFromPreparedCheckTableStorage (azureTableService, checkCode, logger) {
    const check = await azureStorageHelper.getFromPreparedCheckTableStorage(azureTableService, checkCode, logger)
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
  },

  /**
   * Make a request for the pupil-status to be updated for multiple pupils
   * @param {[{pupilId: <number>, checkCode: <string>}]} checkData - must contain `pupilId` and `checkCode` props
   * @return {Promise<*|Promise<*>>}
   */
  updatePupilStatus: async function (logger, logPrefix, checkData) {
    logger.info(`${logPrefix}: updatePupilStatus(): got ${checkData.length} pupils`)
    // Batch the async messages up, to limit max concurrency
    const batches = R.splitEvery(100, checkData)
    checkData = null

    logger.verbose(`${logPrefix}: updatePupilStatus(): ${batches.length} batches detected`)

    batches.forEach(async (checks, batchNumber) => {
      try {
        const msgs = checks.map(check => this.addMessageToQueue('pupil-status', {
          version: 1,
          pupilId: check.pupilId,
          checkCode: check.checkCode
        }))
        await Promise.all(msgs)
        logger.verbose(`${logPrefix}: batch ${batchNumber} complete`)
      } catch (error) {
        logger.error(`${logPrefix}: updatePupilStatus(): ERROR: ${error.message}`)
      }
    })
  },

  /**
   * Filter for live checks and make a request for the pupil-status to be updated for multiple pupils
   * @param {Object} logger
   * @param {String} logPrefix
   * @param {[{checkId: <number>, pupilId: <number>, checkCode: <string>, isLiveCheck: <boolean>}]} checkData - must contain `checkId`, `pupilId`, `checkCode` and `isLiveCheck` props
   * @return {Promise<*|Promise<*>>}
   */
  updatePupilStatusForLiveChecks: async function (logger, logPrefix, checkData) {
    logger.info(`${logPrefix}: updatePupilStatus(): got ${checkData.length} pupils`)
    // Batch the async messages up for live checks only, to limit max concurrency
    const batches = R.splitEvery(100, R.filter(c => c.isLiveCheck, checkData))
    checkData = null

    logger.verbose(`${logPrefix}: updatePupilStatus(): ${batches.length} batches detected`)

    batches.forEach(async (checks, batchNumber) => {
      try {
        const msgs = checks.map(check => this.addMessageToQueue('pupil-status', {
          version: 1,
          pupilId: check.pupilId,
          checkCode: check.checkCode
        }))
        await Promise.all(msgs)
        logger.verbose(`${logPrefix}: batch ${batchNumber} complete`)
      } catch (error) {
        logger.error(`${logPrefix}: updatePupilStatus(): ERROR: ${error.message}`)
      }
    })
  }
}

export default azureStorageHelper
