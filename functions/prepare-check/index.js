const R = require('ramda')
const preparedCheckSchemaValidator = require('../lib/prepared-check-schema-validator')

/**
 * Write to Table Storage for fast pupil authentication
 * Reads from a queue
 * @param context
 * @param {} prepareCheckMessage
 */
module.exports = function (context, prepareCheckMessage) {
  context.log('prepare-check: message received', prepareCheckMessage.checkCode)
  // TODO: Add a version strategy: version field, version handler.
  // TODO: Add batch processing: e.g. handle 100 at a time
  try {
    preparedCheckSchemaValidator.validateMessage(prepareCheckMessage)
  } catch (error) {
    // After 5 attempts at processing the message will be moved to the poison queue
    // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue#trigger---poison-messages
    context.log.error('prepareCheck: message failed validation', prepareCheckMessage.checkCode)
    context.done(error)
    return
  }

  const preparedCheck = {
    partitionKey: prepareCheckMessage.schoolPin,
    rowKey: prepareCheckMessage.pupilPin,
    checkCode: prepareCheckMessage.pupil.checkCode,
    pupilId: prepareCheckMessage.pupil.id,
    schoolId: prepareCheckMessage.school.id,
    questions: prepareCheckMessage.questions,
    pinExpiresAt: prepareCheckMessage.pupil.pinExpiresAt,
    pupil: R.omit(['id', 'checkFormAllocationId', 'pinExpiresAt'], prepareCheckMessage.pupil),
    school: prepareCheckMessage.school,
    config: prepareCheckMessage.config,
    tokens: prepareCheckMessage.tokens,
    isCollected: false,
    collectedAt: null,
    createdAt: new Date(), // This ought to work but doesn't: {'_': new Date(), '$': 'Edm.DateTime'},
    updatedAt: new Date()
  }

  const outputProp = 'data'

  // Happy path - write to Table Storage
  context.bindings[outputProp] = []
  context.bindings[outputProp].push(preparedCheck)
  context.done()
}
