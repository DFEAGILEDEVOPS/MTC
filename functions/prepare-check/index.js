const R = require('ramda')
const preparedCheckSchemaValidator = require('../lib/prepared-check-schema-validator')
const azure = require('azure-storage')
const azureStorageHelper = require('../lib/azure-storage-helper')
const entGen = azure.TableUtilities.entityGenerator
const moment = require('moment')
const uuid = require('uuid/v4')

/**
 * Write to Table Storage for fast pupil authentication
 * Reads from a queue
 * @param context
 * @param {Object} prepareCheckMessage
 */
module.exports = async function (context, prepareCheckMessage) {
  context.log('prepare-check: message received', prepareCheckMessage.checkCode)
  try {
    preparedCheckSchemaValidator.validateMessage(prepareCheckMessage)
  } catch (error) {
    // After 5 attempts at processing the message will be moved to the poison queue
    // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue#trigger---poison-messages
    context.log.error('prepareCheck: message failed validation', prepareCheckMessage.checkCode)
    throw error
  }

  const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
  const preparedCheckTable = 'preparedCheck'

  const entity = {
    PartitionKey: entGen.String(prepareCheckMessage.schoolPin),
    RowKey: entGen.String('' + prepareCheckMessage.pupilPin),
    checkCode: entGen.Guid(prepareCheckMessage.pupil.checkCode),
    collectedAt: null,
    config: entGen.String(JSON.stringify(prepareCheckMessage.config)),
    createdAt: entGen.DateTime(new Date()),
    isCollected: entGen.Boolean(false),
    pinExpiresAt: entGen.DateTime(moment(prepareCheckMessage.pupil.pinExpiresAt).toDate()),
    pupil: entGen.String(JSON.stringify(R.omit(['id', 'checkFormAllocationId', 'pinExpiresAt'], prepareCheckMessage.pupil))),
    pupilId: entGen.Int32(prepareCheckMessage.pupil.id),
    questions: entGen.String(JSON.stringify(prepareCheckMessage.questions)),
    school: entGen.String(JSON.stringify(prepareCheckMessage.school)),
    schoolId: entGen.Int32(prepareCheckMessage.school.id),
    tokens: entGen.String(JSON.stringify(prepareCheckMessage.tokens)),
    updatedAt: entGen.DateTime(new Date())
  }

  await azureTableService.insertEntityAsync(preparedCheckTable, entity)

  const outputProp = 'data'
  context.bindings[outputProp] = []
  context.bindings[outputProp].push({
    PartitionKey: prepareCheckMessage.checkCode,
    RowKey: uuid(),
    eventType: 'check-prepare',
    payload: JSON.stringify(prepareCheckMessage)
  })
}
