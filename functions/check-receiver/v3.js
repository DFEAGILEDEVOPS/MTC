'use strict'

const moment = require('moment')
const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()

// versions 1 and 2 of complete check message processing are in the obsolete completed-checks function
const v3 = {
  process: async function (context, receivedCheck) {
    // persist to receivedCheck table
    const entity = {
      PartitionKey: receivedCheck.schoolUUID,
      RowKey: receivedCheck.checkCode,
      archive: receivedCheck.archive,
      checkReceivedAt: moment().toDate(),
      messageVersion: receivedCheck.version
    }
    /*  context.bindings.receivedCheckTable = []
    context.bindings.receivedCheckTable.push(entity) */
    await azureTableService.insertEntityAsync('receivedCheck', entity)

    // put message on validation queue
    const message = {
      checkCode: receivedCheck.checkCode,
      schoolUUID: receivedCheck.schoolUUID,
      version: 1
    }
    context.bindings.checkValidationQueue = [message]
  }
}

module.exports = v3
