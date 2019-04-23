'use strict'

const moment = require('moment')
const R = require('ramda')
const azureStorageHelper = require('../lib/azure-storage-helper')
const azureQueueService = azureStorageHelper.getPromisifiedAzureQueueService()
const sqlService = require('../lib/sql/sql.service')

const feedbackQueue = 'pupil-feedback'
const functionName = 'feedback'

async function fetchFeedBackMessages (logger) {
  try {
    return await azureQueueService.getMessagesAsync(feedbackQueue, { numOfMessages: 32, visibilityTimeout: 60 })
  } catch (error) {
    logger.error('Failed to fetch new pupil-feedback messages from the queue: ' + error.message)
    logger.error(error)
    // If we are having difficulty getting new messages from the queue, bail out and let the next timer trigger pick up
    // the remaining work
    return null
  }
}

const v1Service = {
  process: async function process (logger) {
    const cutoffTime = moment().add(9, 'minutes').add(45, 'seconds')
    let result // object
    let totalNumberOfMessagesProcessed = 0
    let totalNumberOfInvalidMessages = 0


    result = await fetchFeedBackMessages()
    while (result && result.result.length && moment().isBefore(cutoffTime)) {
      const batchResult = await processBatch(result, logger)
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

async function processBatch (result, logger) {
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
    logger.error(`${functionName}: Failed to delete messages from the '${feedbackQueue}' queue: ${error.message}`)
    throw error
  }

  numberOfMessagesProcessed = messagesProcessed.length
  numberOfInvalidMessages = (messages.length - messagesProcessed.length)

  return {
    batchProcessCount: numberOfMessagesProcessed,
    batchInvalidCount: numberOfInvalidMessages
  }
}

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

async function deleteProcessedMessages (messages) {
  const deleteMsgPromises = messages.map(msg => {
    azureQueueService.deleteMessageAsync(feedbackQueue, msg.messageId, msg.popReceipt)
  })

  return Promise.all(deleteMsgPromises)
}

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
