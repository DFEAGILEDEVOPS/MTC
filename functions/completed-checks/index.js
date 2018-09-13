'use strict'

const azureStorage = require('azure-storage')
const bluebird = require('bluebird')
const moment = require('moment')
const sqlService = require('less-tedious')
const uuid = require('uuid/v4')
const winston = require('winston')
const { TYPES } = require('tedious')
const R = require('ramda')

winston.level = 'error'
const config = require('../config')
sqlService.initialise(config)
const { deleteFromPreparedCheckTableStorage, getPromisifiedAzureTableService } = require('../lib/lib')

// SQL server table
const checkResultTable = '[checkResult]'
const checkFormAllocationTable = '[checkFormAllocation]'
const schema = ['mtc_admin']
const checkStatusTable = '[checkStatus]'
const checkTable = '[checkFormAllocation]'

// Table Storage
const azureTableService = getPromisifiedAzureTableService()

module.exports = async function (context, completedCheckMessage) {
  context.log('completed-check message received', completedCheckMessage.checkCode)

  try {
    await savePayloadToAdminDatabase(completedCheckMessage, context.log)
    context.log('SUCCESS: Admin DB payload updated')
  } catch (error) {
    context.log.error(`ERROR: unable to update admin db payload for [${completedCheckMessage.checkCode}]`)
    throw error
  }

  try {
    await updateCheckStatusToComplete(completedCheckMessage.checkCode, context.log)
    context.log('SUCCESS: Admin DB check status updated')
  } catch (error) {
    context.log.error(`ERROR: unable to update admin db for [${completedCheckMessage.checkCode}]`)
    throw error
  }

  // Delete the row in the preparedCheck table - prevent pupils logging in again.
  // This is a backup process in case the check-started message was not received.
  try {
    await deleteFromPreparedCheckTableStorage(azureTableService, completedCheckMessage.checkCode, context.log)
    context.log('SUCCESS: pupil check row deleted from preparedCheck table')
  } catch (error) {
    // We can ignore "not found" errors in this function
    if (error.type !== 'NOT_FOUND') {
      context.log.error(`ERROR: unable to delete from table storage for [${completedCheckMessage.checkCode}]`)
      throw error
    }
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
}

/**
 * High level function to save the payload into the admin db
 * @param completedCheckMessage
 * @param logger
 * @return {Promise<void>}
 */
async function savePayloadToAdminDatabase (completedCheckMessage, logger) {
  let checkFormAllocationData

  try {
    checkFormAllocationData = await sqlFetchCheckFormAllocation(completedCheckMessage.checkCode)
    logger.info('savePayloadToAdminDatabase: data retrieved from SQL: ' + checkFormAllocationData)
  } catch (error) {
    logger.error(`ERROR: savePayloadToAdminDatabase: failed to retrieve checkFormAllocationData for checkCode: [${completedCheckMessage.checkCode}]`)
    throw error
  }

  try {
    await sqlInsertPayload(completedCheckMessage, checkFormAllocationData.id)
  } catch (error) {
    logger.error(`ERROR: savePayloadToAdminDatabase: failed to insert for checkCode: [${completedCheckMessage.checkCode}]`)
    throw error
  }

  logger.info(`SUCCESS: savePayloadToAdminDatabase: succeeded for checkCode: [${completedCheckMessage.checkCode}]`)
}

/**
 * Retrieve the checkFormAllocation data from the db
 * @param checkCode
 * @return {Promise<void>}
 */
async function sqlFetchCheckFormAllocation(checkCode) {
  const sql = `SELECT TOP 1 * FROM ${schema}.${checkFormAllocationTable} WHERE checkCode = @checkCode`
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    },
  ]
  const res = await sqlService.query(sql, params)
  return R.head(res)
}

/**
 * Insert the payload into the checkResult table
 * @param payload
 * @param checkFormAllocationId
 * @return {Promise<void>}
 */
async function sqlInsertPayload (payload, checkFormAllocationId) {
  const sql = `INSERT INTO ${schema}.${checkResultTable} (payload, checkFormAllocation_id) VALUES (@payload, @checkFormAllocationId)`
  const params = [
    {
      name: 'payload',
      value: JSON.stringify(payload),
      type: TYPES.NVarChar
    },
    {
      name: 'checkFormAllocationId',
      value: checkFormAllocationId,
      type: TYPES.Int
    }
  ]

  await sqlService.modify(sql, params)
}

/**
 * Update the check status to complete
 * @param {string} checkCode - GUID
 * @param {function} logger
 */
async function updateCheckStatusToComplete(checkCode, logger) {
  // For performance reasons we avoid doing a lookup on the checkCode - just issue the UPDATE
  const sql = `UPDATE ${schema}.${checkTable}
               SET checkStatus_id = 
                  (SELECT TOP 1 id from ${schema}.${checkStatusTable} WHERE code = 'CMP')                  
               where checkCode = @checkCode`

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]

  try {
    const res = await sqlService.modify(sql, params)
    if (res.rowsModified === 0) {
      logger('updateAdminDatabaseForCheckStarted: no rows modified.  This may be a bad checkCode.')
    }
  } catch (error) {
    logger('updateAdminDatabaseForCheckStarted: failed to update the SQL DB: ' + error.message)
    throw error
  }
}
