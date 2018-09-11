'use strict'

const azureStorage = require('azure-storage')
const bluebird = require('bluebird')
const moment = require('moment')
const sqlService = require('less-tedious')
const uuid = require('uuid/v4')
const winston = require('winston')
const { TYPES } = require('tedious')

winston.level = 'error'
const config = require('../config')
sqlService.initialise(config)

const checkStatusTable = '[checkStatus]'
const checkResultTable = '[checkResult]'
const checkTable = '[checkFormAllocation]'
const schema = ['mtc_admin']
const preparedCheckTable = 'preparedCheck'
let azureTableService
initAzureTableService()

module.exports = async function (context, completedCheckMessage) {
  context.log('completed-check message received', completedCheckMessage.checkCode)

  // Update the admin database to update the check status to Check Started
  try {
    await savePayloadToAdminDatabase(completedCheckMessage, context.log)
    context.log('SUCCESS: Admin DB updated')
  } catch (error) {
    context.log.error(`ERROR: unable to update admin db for [${checkStartMessage.checkCode}]`)
    throw error
  }

  // Delete the row in the preparedCheck table - prevent pupils logging in again.
  // This is a backup process in case the check-started message was not received.
  try {
    await deleteFromPreparedCheckTableStorage(completedCheckMessage.checkCode, context.log)
    context.log('SUCCESS: pupil check row deleted from preparedCheck table')
  } catch (error) {
    context.log.error(`ERROR: unable to delete from table storage for [${checkStartMessage.checkCode}]`)
    throw error
  }

  // Default output is bound to the pupilEvents table (saved in table storage)
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: completedCheckMessage.checkCode,
    RowKey: uuid(),
    eventType: 'completed-check',
    payload: JSON.stringify(completedCheckMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)
  context.done()
}

async function savePayloadToAdminDatabase (completedCheckMessage, logger) {
  const sql = `INSERT INTO ${schema}.${checkResultTable} (payload, checkFormAllocation_id) VALUES (@payload, @checkFormAllocation_id)`
  const params = [
    {
      name: 'payload',
      value: completedCheckMessage,
      type: TYPES.NVarChar
    },

  ]
}

async function deleteFromPreparedCheckTableStorage (checkCode, logger) {
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
    const msg = `deleteFromPreparedCheckTableStorage(): failed to retrieve prepared check for checkCode: [${checkCode}]`
    logger.error(msg)
    throw new Error(msg)
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
}

/**
 * Promisify the azureStorage library as it still lacks Promise support
 */
function initAzureTableService () {
  if (!azureTableService) {
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
  }
}