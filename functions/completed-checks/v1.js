'use strict'

const moment = require('moment')
const sqlService = require('../lib/sql/sql.service')
const uuid = require('uuid/v4')
const { TYPES } = sqlService

const azureStorageHelper = require('../lib/azure-storage-helper')
const sqlUtil = require('../lib/sql-helper')
const markingService = require('./marking.service')

// SQL server vars
const checkResultTable = '[checkResult]'
const schema = '[mtc_admin]'
const checkStatusTable = '[checkStatus]'
const checkTable = '[check]'

const functionName = 'completed-checks:v1'

const v1 = {
  process: async function (context, completedCheckMessage) {
    await this.handleCompletedCheck(context, completedCheckMessage)
    // Default output is bound to the pupilEvents table (saved in table storage)
    context.bindings.pupilEventsTable = []
    const entity = {
      PartitionKey: completedCheckMessage.checkCode,
      RowKey: uuid(),
      eventType: 'completed-check',
      payload: 'removed',
      processedAt: moment().toDate()
    }
    context.bindings.pupilEventsTable.push(entity)
  },

  handleCompletedCheck: async function handleCompletedCheck (context, completedCheckMessage) {
    let checkData
    try {
      checkData = await sqlUtil.sqlFindCheckWithFormDataByCheckCode(completedCheckMessage.checkCode)
    } catch (error) {
      context.log.error(`${functionName}: ${error.message}`)
      throw error
    }

    if (!canCompleteCheck(checkData.checkStatusCode)) {
      const errorMessage = `${functionName}: ERROR: check ${completedCheckMessage.checkCode} is not in a correct state to be completed. Current state is ${checkData.checkStatusCode}`
      context.log.error(errorMessage)
      throw new Error(errorMessage)
    }

    try {
      await savePayloadToAdminDatabase(completedCheckMessage, checkData, context.log)
    } catch (error) {
      context.log.error(`${functionName}: ${error.message}`)
      throw error
    }

    try {
      await updateAdminDatabaseForCheckComplete(completedCheckMessage.checkCode, context.log)
    } catch (error) {
      context.log.error(`${functionName}: ${error.message}`)
      throw error
    }

    // Request a pupil status change
    try {
      if (checkData.isLiveCheck) {
        const pupilStatusQueueName = 'pupil-status'
        const message = { version: 1, pupilId: checkData.pupil_id, checkCode: completedCheckMessage.checkCode }
        await azureStorageHelper.addMessageToQueue(pupilStatusQueueName, message)
      }
    } catch (error) {
      context.log.error(`${functionName}: ${error.message}`)
      throw error
    }

    // Populate check with marks and update answers table
    try {
      await markingService.mark(completedCheckMessage, checkData)
    } catch (error) {
      context.log.error(`${functionName}: ${error.message}`)
      throw error
    }

    // Delete the row in the preparedCheck table - prevent pupils logging in again.
    // This is a backup process in case the check-started message was not received.
    try {
      await azureStorageHelper.deleteFromPreparedCheckTableStorage(azureTableService, completedCheckMessage.checkCode, context.log)
    } catch (error) {
      context.log.verbose(`${functionName}: ${error.message}`)
    }
  }
}

// Table Storage
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()

/**
 * High level function to save the payload into the admin db
 * @param {object} completedCheckMessage
 * @param {object} checkData
 * @param logger
 * @return {Promise<void>}
 */
async function savePayloadToAdminDatabase (completedCheckMessage, checkData, logger) {
  // Don't process any checks more than once
  if (checkData.receivedByServerAt) {
    const msg = `${functionName}: ERROR: payload re-submission is banned for check ${checkData.checkCode}`
    logger.error(msg)
    throw new Error(msg)
  }

  if (!checkData.startedAt) {
    // Back-fill the check startedAt time using audit log data
    try {
      const checkStartedAuditEvent = findAuditEvent(completedCheckMessage, 'CheckStarted')
      await sqlUpdateCheckStartedAt(checkData.id, moment(checkStartedAuditEvent.clientTimestamp))
      logger(`${functionName}: updated check start date from audit entry for checkCode: ${checkData.checkCode}`)
    } catch (error) {
      logger.error(`${functionName}: Failed to back-fill checkStarted event for checkCode: ${checkData.checkCode}: ${error.message}`)
    }
  }

  try {
    await sqlInsertPayload(completedCheckMessage, checkData.id)
  } catch (error) {
    logger.error(`${functionName}: ERROR: savePayloadToAdminDatabase(): failed to insert for checkCode: ${completedCheckMessage.checkCode}`)
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
  const sql = `UPDATE [mtc_admin].[check]
               SET checkStatus_id =
                  (SELECT TOP 1 id from ${schema}.${checkStatusTable} WHERE code = 'CMP'),
               receivedByServerAt = @receivedByServerAt
               WHERE checkCode = @checkCode;
               
               UPDATE  [mtc_admin].[pupil] 
               SET checkComplete = 1
               WHERE
                id = (SELECT TOP 1 pupil_id from [mtc_admin].[check] where checkCode = @checkCode);
               `

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
    const res = await sqlService.modifyWithTransaction(sql, params)
    if (res.rowsModified === 0) {
      logger(`${functionName}: updateAdminDatabaseForCheckStarted(): no rows modified.  This may be a bad checkCode ${checkCode}`)
    }
  } catch (error) {
    logger(`${functionName}: updateAdminDatabaseForCheckStarted(): failed to update the SQL DB for ${checkCode} : ${error.message}`)
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
    throw new Error(`${functionName}: No matching audit events found`)
  }
  const logEntry = logEntries[0]
  if (!Object.prototype.hasOwnProperty.call(logEntry, 'clientTimestamp')) {
    throw new Error(`${functionName}: No \`clientTimestamp\` property found`)
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
    throw new Error(`${functionName}: Invalid type for clientTimestamp`)
  }

  const sql = `UPDATE ${schema}.${checkTable}
               SET startedAt = @startedAt
               WHERE id = @checkId`

  const params = [
    { name: 'checkId', value: checkId, type: TYPES.Int },
    { name: 'startedAt', value: clientTimestamp, type: TYPES.DateTimeOffset }
  ]

  return sqlService.modify(sql, params)
}

/**
 * Function that determines if the check should be accepted or rejected
 * @param checkStatusCode - the current check status `code` from the master DB
 * @return {boolean}
 */
function canCompleteCheck (checkStatusCode) {
  let result = false
  switch (checkStatusCode) {
    case 'COL': // Collected (started msg may have git lost)
    case 'STD': // Started
    case 'NTR': // Not received
    case 'EXP': // Expired
      result = true
      break
    default:
      result = false
  }
  return result
}

module.exports = v1
