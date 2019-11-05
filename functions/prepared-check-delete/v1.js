'use strict'

const azureStorageHelper = require('../lib/azure-storage-helper')

const v1 = {
  process: async function process (logger, queueMessage) {
    validateMessage(queueMessage)
    const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
    try {
      await azureStorageHelper.deleteFromPreparedCheckTableStorage(azureTableService, queueMessage.checkCode, logger)
    } catch (error) {
      if (error.type === 'NOT_FOUND') {
        return
      }
      throw error
    }
  }
}

function validateMessage (queueMessage) {
  if (!Object.prototype.hasOwnProperty.call(queueMessage, 'checkCode')) {
    throw new Error('missing checkCode')
  }
  if (!Object.prototype.hasOwnProperty.call(queueMessage, 'reason')) {
    throw new Error('missing reason')
  }
  if (!Object.prototype.hasOwnProperty.call(queueMessage, 'actionedByUserId')) {
    throw new Error('missing actionedByUserId')
  }
}

module.exports = v1
