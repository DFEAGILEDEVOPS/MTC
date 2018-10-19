'use strict'

const moment = require('moment')
const sqlService = require('less-tedious')
const uuid = require('uuid/v4')
const winston = require('winston')
const { TYPES } = require('tedious')

winston.level = 'error'
const config = require('../config')
sqlService.initialise(config)
const { deleteFromPreparedCheckTableStorage, getPromisifiedAzureTableService } = require('../lib/azure-storage-helper')
const sqlUtil = require('../lib/sql-helper')

// SQL server table
const checkResultTable = '[checkResult]'

const schema = ['mtc_admin']
const checkStatusTable = '[checkStatus]'
const checkTable = '[check]'

// Table Storage
const azureTableService = getPromisifiedAzureTableService()

module.exports = async function (context, completedCheckMessage) {
  context.log('completed-check message received', completedCheckMessage.checkCode)

  try {
    await savePayloadToAdminDatabase(completedCheckMessage, context.log)
  } catch (error) {
    context.log.error(`ERROR: unable to update admin db payload for [${completedCheckMessage.checkCode}]`)
    throw error
  }

  try {
    await updateAdminDatabaseForCheckComplete(completedCheckMessage.checkCode, context.log)
  } catch (error) {
    context.log.error(`ERROR: unable to update admin db for [${completedCheckMessage.checkCode}]`)
    throw error
  }

  // Delete the row in the preparedCheck table - prevent pupils logging in again.
  // This is a backup process in case the check-started message was not received.
  try {
    await deleteFromPreparedCheckTableStorage(azureTableService, completedCheckMessage.checkCode, context.log)
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
  let checkData

  try {
    checkData = await sqlUtil.sqlFindCheckByCheckCode(completedCheckMessage.checkCode)
  } catch (error) {
    logger.error(`completed-check: ERROR: savePayloadToAdminDatabase(): failed to retrieve checkFormAllocationData for checkCode: ${completedCheckMessage.checkCode}`)
    throw error
  }

  try {
    await sqlInsertPayload(completedCheckMessage, checkData.id)
  } catch (error) {
    logger.error(`completed-check: ERROR: savePayloadToAdminDatabase(): failed to insert for checkCode: ${completedCheckMessage.checkCode}`)
    throw error
  }
}

/**
 * Insert the payload into the checkResult table
 * @param {object} payload
 * @param {number} checkId
 * @return {Promise<void>}
 */
async function sqlInsertPayload (payload, checkId) {
  const sql = `INSERT INTO ${schema}.${checkResultTable} (payload, check_id) VALUES (@payload, @checkId)`
  const params = [
    {
      name: 'payload',
      value: JSON.stringify(payload),
      type: TYPES.NVarChar
    },
    {
      name: 'checkId',
      value: checkId,
      type: TYPES.Int
    }
  ]

  await sqlService.modify(sql, params)
}

/**
 * Update the Admin DB
 * Set check status to complete, received timestamp to current timestamp
 * @param {string} checkCode - GUID
 * @param {function} logger
 */
async function updateAdminDatabaseForCheckComplete (checkCode, logger) {
  // For performance reasons we avoid doing a lookup on the checkCode - just issue the UPDATE
  const sql = `UPDATE ${schema}.${checkTable}
               SET checkStatus_id = 
                  (SELECT TOP 1 id from ${schema}.${checkStatusTable} WHERE code = 'CMP'),
               receivedByServerAt = @receivedByServerAt          
               WHERE checkCode = @checkCode`

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    },
    {
      name: 'receivedByServerAt',
      value: new Date(),
      type: TYPES.DateTime
    }
  ]

  try {
    const res = await sqlService.modify(sql, params)
    if (res.rowsModified === 0) {
      logger(`completed-check: updateAdminDatabaseForCheckStarted(): no rows modified.  This may be a bad checkCode ${checkCode}`)
    }
  } catch (error) {
    logger(`completed-check: updateAdminDatabaseForCheckStarted(): failed to update the SQL DB for ${checkCode} : ${error.message}`)
    throw error
  }
}
