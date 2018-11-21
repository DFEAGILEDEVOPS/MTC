'use strict'

const azureStorage = require('azure-storage')
const azureStorageHelper = require('../lib/azure-storage-helper')
const preparedCheckTable = 'preparedCheck'
const uuid = require('uuid/v4')
const moment = require('moment')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const pathOr = require('ramda').pathOr

const v1 = {
  process: async function process(logger) {
    // Update the check status in the SQL DB
    const meta = await deleteExpiredChecks(logger)

    return {
      checksExpired: meta.checksExpired
    }
  }
}

/**
 * Delete expired checks from the Azure Table Storage `preparedCheck` cache table
 * @return {Promise}
 */
async function deleteExpiredChecks (logger) {
  const query = new azureStorage.TableQuery()
    .top(500)
    .where('pinExpiresAt le ?', new Date())

  let data
  try {
    data = await azureTableService.queryEntitiesAsync(preparedCheckTable, query, null)
  } catch (error) {
    const msg = `deleteExpiredChecks(): error during query: ${error.message}`
    logger.error(msg)
    logger.error(error.message)
    throw error
  }
  const entities = pathOr([], ['response', 'body', 'value'], data)

  for (let preparedCheck of entities) {
    try {
      const entity = {
        PartitionKey: preparedCheck.PartitionKey,
        RowKey: preparedCheck.RowKey
      }
      await azureTableService.deleteEntityAsync(preparedCheckTable, entity)
      await updatePupilEventTable(preparedCheck.checkCode.toUpperCase())
    } catch (error) {
      logger.error(`expire-prepared-checks: ERROR: deleteExpiredChecks(): ${preparedCheck.checkCode}: ${error.message}`)
    }
  }

  return {
    checksExpired: Array.isArray(entities) ? entities.length : 0
  }
}

async function updatePupilEventTable (checkCode) {
  const eventTable = 'pupilEvent'
  const event = {
    PartitionKey: checkCode,
    RowKey: uuid(),
    eventType: 'expire-prepared-check',
    payload: 'The check was expunged from the `preparedCheck` table',
    processedAt: moment().toDate()
  }
  return azureTableService.insertEntityAsync(eventTable, event)
}

module.exports = v1
