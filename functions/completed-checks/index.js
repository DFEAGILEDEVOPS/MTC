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

  if (!checkData.startedAt) {
    // Back-fill the check startedAt time using audit log data
    try {
      const checkStartedAuditEvent = findAuditEvent(completedCheckMessage, 'CheckStarted')
      await sqlUpdateCheckStartedAt(checkData.id, moment(checkStartedAuditEvent.clientTimestamp))
      logger(`completed-check: updated check start date from audit entry for checkCode: ${checkData.checkCode}`)
    } catch (error) {
      logger.error(`completed-check: Failed to back-fill checkStarted event for checkCode: ${checkData.checkCode}: ${error.message}`)
    }
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
      type: TYPES.DateTimeOffset
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

/**
 * Find a specific audit event in the payload message
 * @param payload - the payload object
 * @param {string} auditEventType - e.g. 'CheckStarted'
 */
function findAuditEvent (payload, auditEventType) {
  const logEntries = payload.audit.filter(logEntry => logEntry.type === auditEventType)
  if (!logEntries.length) {
    throw new Error('No matching audit events found')
  }
  const logEntry = logEntries[0]
  if (!logEntry.hasOwnProperty('clientTimestamp')) {
    throw new Error('No `clientTimestamp` property found')
  }
  return logEntry
}

/**
 * Update the check start time with data obtained from the check audit log
 * @param {number} checkId
 * @param {moment} clientTimestamp
 * @return {Promise<void>}
 */
async function sqlUpdateCheckStartedAt (checkId, clientTimestamp) {
  if (!moment.isMoment(clientTimestamp)) {
    throw new Error('Invalid type for clientTimestamp')
  }

  const sql = `UPDATE ${schema}.${checkTable}
               SET startedAt = @startedAt
               WHERE id = @checkId`

  const params = [
    { name: 'checkId', value: checkId, type: TYPES.Int },
    { name: 'startedAt', value: clientTimestamp, type: TYPES.DateTimeOffset }
  ]

  return await sqlService.modify(sql, params)
}
