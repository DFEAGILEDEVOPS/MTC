'use strict'

const azureStorageHelper = require('../lib/azure-storage-helper')
const preparedCheckSchemaValidator = require('../lib/prepared-check-schema-validator')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const preparedCheckTable = 'preparedCheck'
const prepareEntity = require('./prepare-entity')

async function process (context, v1Message) {
  try {
    preparedCheckSchemaValidator.validateMessage(v1Message)
  } catch (error) {
    // After $MAX_ATTEMPTS attempts at processing the message will be moved to the poison queue
    // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue#trigger---poison-messages
    context.log.error('prepareCheck: message failed validation', v1Message.checkCode)
    throw error
  }

  const entity = prepareEntity(v1Message)

  await azureTableService.insertEntityAsync(preparedCheckTable, entity)

  return { processCount: 1 }
}

module.exports = { process }
