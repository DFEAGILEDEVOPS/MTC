'use strict'

const azure = require('azure-storage')
const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const preparedCheckSchemaValidator = require('../lib/prepared-check-schema-validator')
const preparedCheckTable = 'preparedCheck'
const prepareEntity = require('./prepare-entity')

function validate (context, v2Message) {
  for (const preparedCheck of v2Message.messages) {
    try {
      preparedCheckSchemaValidator.validateMessage(preparedCheck)
    } catch (error) {
      // After 5 attempts at processing the message will be moved to the poison queue
      // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue#trigger---poison-messages
      context.log.error('prepare-check v2: message failed validation', preparedCheck.checkCode)
      throw error
    }
  }
}

async function process (context, v2Message) {
  validate(context, v2Message)

  const batch = new azure.TableBatch()

  let processCount = 0
  for (const preparedCheck of v2Message.messages) {
    context.log.verbose(`prepare-check: v2 process(): checkCode: ${preparedCheck.checkCode}`)
    batch.insertEntity(prepareEntity(preparedCheck))
    processCount += 1
  }

  const batchResult = await azureTableService.executeBatchAsync(preparedCheckTable, batch)

  if (batchResult.response.isSuccessful !== true) {
    context.error('prepare-check: v2 process(): there were one or more errors in the batch', batchResult.result)
    for (const result of batchResult.result) {
      if (result.error) {
        context.log.error(`prepare-check: v2 process(): error in checkCode ${result.entity.checkCode}: ${result.error}`)
      }
    }
  }

  return {
    processCount
  }
}

module.exports = { process }
