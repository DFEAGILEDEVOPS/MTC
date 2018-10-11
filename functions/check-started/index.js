'use strict'

const moment = require('moment')
const winston = require('winston')
const uuid = require('uuid/v4')
const { TYPES } = require('tedious')
const sqlService = require('less-tedious')
const config = require('../config')

winston.level = 'error'
sqlService.initialise(config)
const { deleteFromPreparedCheckTableStorage, getPromisifiedAzureTableService } = require('../lib/azure-storage-helper')
const sqlUtil = require('../lib/sql-helper')

const checkStatusTable = '[checkStatus]'
const checkTable = '[check]'
const schema = '[mtc_admin]'
const azureTableService = getPromisifiedAzureTableService()

module.exports = async function (context, checkStartMessage) {
  context.log('check-started message received', checkStartMessage.checkCode)

  // Update the admin database to update the check status to Check Started
  try {
    context.log('checkStartMessage: ', checkStartMessage)
    await updateAdminDatabaseForCheckStarted(
      checkStartMessage.checkCode,
      new Date(checkStartMessage.clientCheckStartedAt),
      context.log)
    context.log('SUCCESS: Admin DB updated')
  } catch (error) {
    context.log.error(`ERROR: unable to update admin db for [${checkStartMessage.checkCode}]`)
    throw error
  }

  // Delete the row in the preparedCheck table for live checks only - prevent pupils logging in again.
  try {
    const checkData = await sqlUtil.sqlFindCheckByCheckCode(checkStartMessage.checkCode)
    if (checkData.isLiveCheck) {
      await deleteFromPreparedCheckTableStorage(azureTableService, checkStartMessage.checkCode, context.log)
      context.log('SUCCESS: pupil check row deleted from preparedCheck table')
    }
  } catch (error) {
    context.log.error(`ERROR: unable to delete from table storage for [${checkStartMessage.checkCode}]`)
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
      logger('updateAdminDatabaseForCheckStarted: no rows modified.  This may be a bad checkCode.')
    }
  } catch (error) {
    logger('updateAdminDatabaseForCheckStarted: failed to update the SQL DB: ' + error.message)
    throw error
  }
}
