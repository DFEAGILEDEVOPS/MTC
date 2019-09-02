'use strict'

const moment = require('moment')
/*
  this function has 2 outputs - the check-validation queue and the receivedCheck table.
  we have to use the azure-storage lib due to a race condition which occurs due to the
  check-validator receiving the message before the receivedCheck entry has been inserted.
*/
const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()

// versions 1 and 2 of complete check message processing are in the obsolete completed-checks function
const v3 = {
  process: async function (context, receivedCheck) {
    const entity = {
      PartitionKey: receivedCheck.schoolUUID,
      RowKey: receivedCheck.checkCode,
      archive: receivedCheck.archive,
      checkReceivedAt: moment().toDate(),
      messageVersion: receivedCheck.version
    }
    await azureTableService.insertEntityAsync('receivedCheck', entity)

    const message = {
      checkCode: receivedCheck.checkCode,
      schoolUUID: receivedCheck.schoolUUID,
      version: 1
    }
    context.bindings.checkValidationQueue = [message]
  }
}

module.exports = v3
