'use strict'

const R = require('ramda')
const azure = require('azure-storage')
const moment = require('moment')
const azureStorageHelper = require('../lib/azure-storage-helper')
const preparedCheckSchemaValidator = require('../lib/prepared-check-schema-validator')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const entGen = azure.TableUtilities.entityGenerator
const preparedCheckTable = 'preparedCheck'

async function process (context, v1Message) {
  try {
    preparedCheckSchemaValidator.validateMessage(v1Message)
  } catch (error) {
    // After 5 attempts at processing the message will be moved to the poison queue
    // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue#trigger---poison-messages
    context.log.error('prepareCheck: message failed validation', v1Message.checkCode)
    throw error
  }

  const entity = {
    PartitionKey: entGen.String(v1Message.schoolPin),
    RowKey: entGen.String('' + v1Message.pupilPin),
    checkCode: entGen.Guid(v1Message.pupil.checkCode),
    collectedAt: null,
    config: entGen.String(JSON.stringify(v1Message.config)),
    createdAt: entGen.DateTime(new Date()),
    isCollected: entGen.Boolean(false),
    pinExpiresAt: entGen.DateTime(moment(v1Message.pupil.pinExpiresAt).toDate()),
    pupil: entGen.String(JSON.stringify(R.omit(['id', 'checkFormAllocationId', 'pinExpiresAt'], v1Message.pupil))),
    pupilId: entGen.Int32(v1Message.pupil.id),
    questions: entGen.String(JSON.stringify(v1Message.questions)),
    school: entGen.String(JSON.stringify(v1Message.school)),
    schoolId: entGen.Int32(v1Message.school.id),
    tokens: entGen.String(JSON.stringify(v1Message.tokens)),
    updatedAt: entGen.DateTime(new Date())
  }

  await azureTableService.insertEntityAsync(preparedCheckTable, entity)
}

module.exports = { process }
