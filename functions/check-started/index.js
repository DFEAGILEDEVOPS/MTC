'use strict'

const moment = require('moment')
const process = require('process')
const sqlService = require('../lib/sql/sql.service')
const uuid = require('uuid/v4')
const { TYPES } = sqlService

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const azureStorageHelper = require('../lib/azure-storage-helper')
const sqlUtil = require('../lib/sql-helper')

const checkStatusTable = '[checkStatus]'
const checkTable = '[check]'
const schema = '[mtc_admin]'
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()

module.exports = async function (context, checkStartMessage) {
  context.log('check-started: message received', checkStartMessage.checkCode)

  const checkData = await sqlUtil.sqlFindCheckByCheckCode(checkStartMessage.checkCode)
  if (checkData.isLiveCheck && !canCheckBeStarted(checkData.code)) {
    context.log.error(`check-started: ERROR: Unable to process a check-started message for check ${checkData.checkCode}`)
    return // consume the message
  }

  // Update the admin database to update the check status to Check Started
  // try {
  //   await updateAdminDatabaseForCheckStarted(
  //     checkStartMessage.checkCode,
  //     new Date(checkStartMessage.clientCheckStartedAt),
  //     context.log
  //   )
  //   context.log(`check-started: SUCCESS: Admin DB updated for ${checkStartMessage.checkCode}`)
  // } catch (error) {
  //   context.log.error(`check-started: ERROR: unable to update admin db for ${checkStartMessage.checkCode}`)
  //   throw error
  // }

  // Delete the row in the preparedCheck table for live checks only - prevent pupils logging in again.]
  try {
    if (checkData.isLiveCheck) {
      await azureStorageHelper.deleteFromPreparedCheckTableStorage(azureTableService, checkStartMessage.checkCode, context.log)
      context.log('check-started: SUCCESS: pupil check row deleted from preparedCheck table for', checkStartMessage.checkCode)
      await requestPupilStatusChange(checkData.pupil_id, checkData.checkCode)
    }
  } catch (error) {
    context.log.error(`check-started: ERROR: ${checkStartMessage.checkCode}: ${error.message}`)
    throw error
  }

  // Store the raw message to an audit log
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: checkStartMessage.checkCode.toUpperCase(),
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

/**
 * Check if we are allowed to transition to check started
 * E.g. A restart may be cancelled even though it has been issued to the user.  If so, the user
 * could go ahead and complete the test.  In those cases the SQL DB would report the check in Expired
 * state.
 * @param code
 * @return {boolean}
 */
function canCheckBeStarted (code) {
  return code === 'COL'
}

/**
 * Place a request for a pupil status change on the queue
 * @param pupilId
 * @param checkCode
 * @return {Promise<*>}
 */
async function requestPupilStatusChange (pupilId, checkCode) {
  const pupilStatusQueueName = 'pupil-status'
  const message = { version: 1, pupilId, checkCode }
  return azureStorageHelper.addMessageToQueue(pupilStatusQueueName, message)
}
