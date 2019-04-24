'use strict'

const azureStorageHelper = require('../lib/azure-storage-helper')
const azureQueueService = azureStorageHelper.getPromisifiedAzureQueueService()
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const moment = require('moment')
const R = require('ramda')
const sqlService = require('../lib/sql/sql.service')
const uuid = require('uuid/v4')

const feedbackQueueName = 'pupil-feedback'
const pupilEventTableName = 'pupilEvent'
const functionName = 'feedback'
let logger

/**
 * Retrieve feedback messages from the queue, 32 at a time
 * @return {Promise<null|*>}
 */
async function fetchFeedBackMessages () {
  try {
    return await azureQueueService.getMessagesAsync(feedbackQueueName, { numOfMessages: 32, visibilityTimeout: 60 })
  } catch (error) {
    logger.error('Failed to fetch new pupil-feedback messages from the queue: ' + error.message)
    logger.error(error)
    // If we are having difficulty getting new messages from the queue, bail out and let the next timer trigger pick up
    // the remaining work
    return null
  }
}

const v1Service = {
  process: async function process (passedLogger) {
    logger = passedLogger
    const cutoffTime = moment().add(9, 'minutes').add(45, 'seconds')
    let result // object
    let totalNumberOfMessagesProcessed = 0
    let totalNumberOfInvalidMessages = 0

    result = await fetchFeedBackMessages()
    while (result && result.result.length && moment().isBefore(cutoffTime)) {
      const batchResult = await processBatch(result)
      totalNumberOfMessagesProcessed += batchResult.batchProcessCount
      totalNumberOfInvalidMessages += batchResult.batchInvalidCount
      result = await fetchFeedBackMessages()
    }

    return {
      processCount: totalNumberOfMessagesProcessed,
      invalidCount: totalNumberOfInvalidMessages
    }
  }
}

/**
 * Generate objects suitable for inserting into the pupilData table
 * @param messages - array of messages
 * @return {Object[]}
 */
function pupilEventData(messages) {
  return messages.map(msg => {
    return {
      PartitionKey: msg.message.checkCode,
      RowKey: uuid(),
      eventType: 'feedback',
      payload: JSON.stringify(msg.message),
      processedAt: new Date()
    }
  })
}

/**
 * Insert array of entities into table storage
 * @param {Object[]} tableData - array of entities
 * @param {String} tableName - name of the azure storage table
 * @return {Promise<*>}
 */
async function parallelInsertToAzureStorageTable(tableData, tableName) {
  const insertPromises = tableData.map(entity => {
    azureTableService.insertEntityAsync(tableName, entity)
  })

  return Promise.all(insertPromises)
}

/**
 * Process multiple queue messages
 * Save to sql DB, remove them from the queue, add the data to pupilEvent table
 * @param result
 * @return {Promise<{processCount: number}|{batchInvalidCount: number, batchProcessCount: *}>}
 */
async function processBatch (result) {
  const messages = result.result
  let messagesProcessed, numberOfMessagesProcessed, numberOfInvalidMessages

  /** messages[] - raw message
   * QueueMessageResult {
          messageId: 'efdaa6d4-3030-42f2-9776-01f8443029a1',
          insertionTime: 'Wed, 17 Apr 2019 14:23:57 GMT',
          expirationTime: 'Wed, 24 Apr 2019 14:23:57 GMT',
          popReceipt: 'AgAAAAMAAAAAAAAAN8ZJCy711AE=',
          timeNextVisible: 'Wed, 17 Apr 2019 14:58:40 GMT',
          dequeueCount: 2,
          messageText: 'IkZlZWRiYWNrIG1lc3NhZ2UgNCI=' }
   */

  if (!(messages && messages.length)) {
    return { processCount: 0 }
  }

  try {
    messagesProcessed = await batchSaveFeedback(decodeMessages(messages))
  } catch (error) {
    logger.error(`${functionName}: Error from batchSaveFeedback(): ${error.message}`)
    throw error
  }

  try {
    await deleteProcessedMessages(messagesProcessed)
  } catch (error) {
    logger.error(`${functionName}: Failed to delete messages from the '${feedbackQueueName}' queue: ${error.message}`)
    throw error
  }

  try {
    const pupilEventEntities = pupilEventData(messagesProcessed)
    console.log(pupilEventEntities)
    await parallelInsertToAzureStorageTable(pupilEventEntities, pupilEventTableName)
  } catch (error) {
    logger.error(`${functionName}: failed to add data to pupil event table`)
  }

  numberOfMessagesProcessed = messagesProcessed.length
  numberOfInvalidMessages = (messages.length - messagesProcessed.length)

  return {
    batchProcessCount: numberOfMessagesProcessed,
    batchInvalidCount: numberOfInvalidMessages
  }
}

/**
 * Add object 'message' to the raw queue message containing the JSON parsed object
 * @param messages
 * @return {*}
 */
function decodeMessages (messages) {
  return messages.map(msg => {
    const buf = Buffer.from(msg.messageText, 'base64')
    const text = buf.toString()
    let obj = ''
    try {
      obj = JSON.parse(text)
    } catch (error) {
      obj = text
    }
    return R.assoc('message', obj, msg)
  })
}

/**
 * Utility function to add database check IDs to the queue messages.
 * @param messages
 * @return {Promise<*>}
 */
async function addDatabaseCheckIds (messages) {
  const msgCheckCodes = messages.map(msg => msg.message.checkCode)
  const { params, paramIdentifiers } = sqlService.buildParameterList(msgCheckCodes, sqlService.TYPES.UniqueIdentifier)
  const sql = `SELECT id, checkCode from [mtc_admin].[check] where checkCode IN (${paramIdentifiers.join(', ')})`
  const checks = await sqlService.query(sql, params)
  const checksByCheckCode = {}
  checks.forEach(check => { checksByCheckCode[check.checkCode] = check.id })
  return messages.map(msg => {
    return R.assoc('checkId', checksByCheckCode[msg.message.checkCode], msg)
  })
}

/**
 * Remove the processed messages from the storage queue
 * @param messages
 * @return {Promise<*>}
 */
async function deleteProcessedMessages (messages) {
  const deleteMsgPromises = messages.map(msg => {
    azureQueueService.deleteMessageAsync(feedbackQueueName, msg.messageId, msg.popReceipt)
  })

  return Promise.all(deleteMsgPromises)
}

/**
 * Saves a batch of messages to the SQL DB.
 * @param messages
 * @return {Promise<*>}
 */
async function batchSaveFeedback (messages) {
  const checkMessages = await addDatabaseCheckIds(messages)
  // Filter out all messages that do not have a valid checkCode
  const messagesToProcess = checkMessages.filter(msg => !!msg.checkId)

  // save the feedback
  const sqls = []
  const params = []
  messagesToProcess.forEach((msg, i) => {
    const stmt = `INSERT INTO [mtc_admin].[pupilFeedback] (check_id, inputType, satisfactionRating, comments) VALUES (@id${i}, @input${i}, @rating${i}, @comment${i});`
    const stmtParams = [
      {
        name: `id${i}`,
        value: msg.checkId,
        type: sqlService.TYPES.Int
      },
      {
        name: `input${i}`,
        value: msg.message.inputType,
        type: sqlService.TYPES.Int
      },
      {
        name: `rating${i}`,
        value: msg.message.satisfactionRating,
        type: sqlService.TYPES.Int
      },
      {
        name: `comment${i}`,
        value: msg.message.comments,
        type: sqlService.TYPES.NVarChar
      }
    ]
    sqls.push(stmt)
    params.push(...stmtParams)
  })

  await sqlService.modify(sqls.join('\n'), params)
  return messagesToProcess
}

module.exports = v1Service
