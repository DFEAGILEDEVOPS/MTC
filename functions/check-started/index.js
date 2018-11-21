'use strict'

const moment = require('moment')
const process = require('process')
const sqlService = require('less-tedious')
const uuid = require('uuid/v4')
const winston = require('winston')
const { TYPES } = require('tedious')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const azureStorageHelper = require('../lib/azure-storage-helper')
const sqlUtil = require('../lib/sql-helper')
const config = require('../config')
sqlService.initialise(config)
winston.level = 'error'

const checkStatusTable = '[checkStatus]'
const checkTable = '[check]'
const schema = '[mtc_admin]'
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()

module.exports = async function (context, checkStartMessage) {
  context.log('check-started: message received', checkStartMessage.checkCode)

  // Update the admin database to update the check status to Check Started
  try {
    await updateAdminDatabaseForCheckStarted(
      checkStartMessage.checkCode,
      new Date(checkStartMessage.clientCheckStartedAt),
      context.log
    )
    context.log(`check-started: SUCCESS: Admin DB updated for ${checkStartMessage.checkCode}`)
  } catch (error) {
    context.log.error(`check-started: ERROR: unable to update admin db for ${checkStartMessage.checkCode}`)
    throw error
  }

  // Delete the row in the preparedCheck table for live checks only - prevent pupils logging in again.]
  let checkData
  try {
    checkData = await sqlUtil.sqlFindCheckByCheckCode(checkStartMessage.checkCode)
    if (checkData.isLiveCheck) {
      await azureStorageHelper.deleteFromPreparedCheckTableStorage(azureTableService, checkStartMessage.checkCode, context.log)
      context.log('check-started: SUCCESS: pupil check row deleted from preparedCheck table for', checkStartMessage.checkCode)
    }
  } catch (error) {
    context.log.error(`check-started: ERROR: unable to delete from table storage for ${checkStartMessage.checkCode}`)
    throw error
  }

  // Request a pupil status change
  try {
    if (checkData.isLiveCheck) {
      const pupilStatusQueueName = 'pupil-status'
      const message = { version: 1, pupilId: checkData.pupil_id, checkCode: checkStartMessage.checkCode }
      await azureStorageHelper.addMessageToQueue(pupilStatusQueueName, message)
    }
  } catch (error) {
    context.log.error(`check-started: Error requesting a pupil-status change for checkCode ${checkStartMessage.checkCode}`)
    throw error
  }

  // Store the raw message to an audit log
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: checkStartMessage.checkCode,
    RowKey: uuid(),
    eventType: 'check-started',
    payload: JSON.stringify(checkStartMessage),
    processedAt: moment().toDate()
  }

  context.bindings.pupilEventsTable.push(entity)
}

/**
 * Update the master SQL Server admin database that the check indicated by <checkCode> has now been started
 * @param {String} checkCode - the unique GUID that identifies the check in the admin DB
 * @param {Date} startedAt
 * @param {Function} logger
 * @return {Promise<void>}
 */
async function updateAdminDatabaseForCheckStarted (checkCode, startedAt, logger) {
  // For performance reasons we avoid doing a lookup on the checkCode - just issue the UPDATE
  const sql = `UPDATE ${schema}.${checkTable}
               SET checkStatus_id = 
                  (SELECT TOP 1 id from ${schema}.${checkStatusTable} WHERE code = 'STD'),
                  startedAt = @startedAt                
               where checkCode = @checkCode`

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    },
    {
      name: 'startedAt',
      value: startedAt,
      type: TYPES.DateTime
    }
  ]

  try {
    const res = await sqlService.modify(sql, params)
    if (res.rowsModified === 0) {
      logger(`check-started: updateAdminDatabaseForCheckStarted(): no rows modified.  This may be a bad checkCode: ${checkCode}`)
    }
  } catch (error) {
    logger(`check-started: updateAdminDatabaseForCheckStarted(): failed to update the SQL DB for ${checkCode}: ${error.message}`)
    throw error
  }
}
