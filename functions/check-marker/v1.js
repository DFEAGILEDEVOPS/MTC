'use strict'

const compressionService = require('../lib/compression.service')
const checkSchema = require('../check-receiver/message-schema/message.v1.json')
const R = require('ramda')
const moment = require('moment')
const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()

const v1 = {
  process: async function (context, checkMetadata) {
    let receivedCheck = findReceivedCheck(context.bindings.receivedCheckTable)

  }
}

function findReceivedCheck (receivedCheckRef) {
  if (!receivedCheckRef) {
    throw new Error('received check reference is undefined')
  }
  if (!Array.isArray(receivedCheckRef)) {
    throw new Error(`received check reference was not an array`)
  }
  if (receivedCheckRef.length === 0) {
    throw new Error('received check reference is empty')
  }
  return receivedCheckRef[0]
}

module.exports = v1
