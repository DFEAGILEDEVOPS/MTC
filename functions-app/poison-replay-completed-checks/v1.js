'use strict'
const azureStorageHelper = require('../lib/azure-storage-helper')
const R = require('ramda')

const functionName = 'poison-replay-completed-checks'
const completedCheckPoisonQueue = 'check-complete-poison'
const completedCheckQueue = 'check-complete'
let logger

async function replayMessage (result) {
  const azureQueueService = azureStorageHelper.getPromisifiedAzureQueueService()
  const completedCheckMessage = JSON.parse(Buffer.from(result.messageText, 'base64').toString())
  const checkCode = R.prop('checkCode', completedCheckMessage)

  if (checkCode) {
    logger.info(`${functionName}: replaying check [${checkCode}] onto queue [${completedCheckQueue}]`)
  } else {
    logger.info(`${functionName}: checkCode not found - replaying unlikely to work`)
  }

  // replay message
  const insertResult = await azureQueueService.createMessageAsync(completedCheckQueue, result.messageText)
  if (insertResult.response.isSuccessful === true) {
    // delete the message from the poison queue
    await azureQueueService.deleteMessageAsync(completedCheckPoisonQueue, result.messageId, result.popReceipt)
  }
}

const v1 = {

  /**
   * Replay multiple messages from the poison queue to the processing queue
   * See: https://azure.github.io/azure-storage-node/QueueService.html#getMessages__anchor
   * @param loggerArg Context.log
   * @return {Promise<{processCount: number, errorCount: number}>}
   */
  process: async function process (loggerArg) {
    logger = loggerArg
    let messages
    let done = false
    const meta = { processCount: 0, errorCount: 0 }
    const azureQueueService = azureStorageHelper.getPromisifiedAzureQueueService()

    while (!done) {
      try {
        const options = { numOfMessages: 32, visibilityTimeout: 120 }
        messages = await azureQueueService.getMessagesAsync(completedCheckPoisonQueue, options)
        logger.info(`${functionName}: Got ${messages.result.length} messages from the queue`)
      } catch (error) {
        logger.error(`${functionName}: Failed to fetch messages: ${error.message}`)
        throw error
      }

      for (const message of messages.result) {
        try {
          await replayMessage(message)
          meta.processCount += 1
        } catch (error) {
          logger.error(`${functionName}: Failed to replay message: ${error.message}`)
          meta.errorCount += 1
        }
      }
      if (messages.result.length === 0) {
        done = true
      }
    }

    return meta
  }
}

module.exports = v1
