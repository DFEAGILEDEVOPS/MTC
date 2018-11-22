const R = require('ramda')
const azure = require('azure-storage')
const azureStorageHelper = require('../lib/azure-storage-helper')
const entGen = azure.TableUtilities.entityGenerator
const moment = require('moment')
const uuid = require('uuid/v4')

/**
 * Write to Table Storage for fast pupil authentication
 * Reads from a queue
 * @param context
 * @param {} prepareCheckMessage
 */
module.exports = async function (context, prepareCheckMessage) {
  context.log('prepare-check: message received', prepareCheckMessage.checkCode)
  try {
    validateMessage(prepareCheckMessage)
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

function validateMessage (message) {
  const check = (prop) => { if (R.not(R.has(prop, message))) { throw new Error(`Message failed validation check: missing field: ${prop}`) } }
  const topLevelProperties = ['schoolPin', 'pupilPin', 'pupil', 'school', 'tokens', 'config', 'questions']
  topLevelProperties.map(check)
  validatePupil(message.pupil)
  validateQuestions(message.questions)
  validateSchool(message.school)
  validateConfig(message.config)
}

function validatePupil (pupil) {
  const pupilProperties = ['firstName', 'lastName', 'dob', 'checkCode']
  schemaValidator(pupil, pupilProperties, 'pupil')
}

function validateQuestions (questions) {
  if (R.not(R.is(Array, questions))) {
    throw new Error('Questions is not an Array')
  }
  questions.map(q => {
    const res = R.props(['order', 'factor2', 'factor2'], q)
    if (R.contains(undefined, res)) {
      throw new Error('Invalid question')
    }
  })
}

function validateSchool (school) {
  const schoolProperties = ['id', 'name']
  schemaValidator(school, schoolProperties, 'school')
}

function validateConfig (config) {
  const configProperties = ['questionTime', 'loadingTime', 'speechSynthesis']
  schemaValidator(config, configProperties, 'config')
}

function schemaValidator (obj, requiredPropertyList, name = 'schema') {
  const check = (prop) => { if (R.not(R.has(prop, obj))) { throw new Error(`Missing ${name} field: ${prop}`) } }
  if (R.not(R.is(Object, obj))) {
    throw new Error(`${name} is not an object`)
  }
  requiredPropertyList.map(check)
}
