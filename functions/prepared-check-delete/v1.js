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
  if (!queueMessage.hasOwnProperty('checkCode')) {
    throw new Error('missing checkCode')
  }
  if (!queueMessage.hasOwnProperty('reason')) {
    throw new Error('missing reason')
  }
  if (!queueMessage.hasOwnProperty('actionedByUserId')) {
    throw new Error('missing actionedByUserId')
  }
}

module.exports = v1
