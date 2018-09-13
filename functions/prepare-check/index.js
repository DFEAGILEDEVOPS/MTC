const R = require('ramda')

/**
 * Write to Table Storage for fast pupil authentication
 * Reads from a queue
 * @param context
 * @param {} prepareCheckMessage
 */
module.exports = function (context, prepareCheckMessage) {
  context.log.verbose('prepareCheck: got message from prepare-check queue', prepareCheckMessage)
  // TODO: Add a version strategy: version field, version handler.
  // TODO: Add batch processing: e.g. handle 100 at a time
  try {
    validateMessage(prepareCheckMessage)
  } catch (error) {
    // After 5 attempts at processing the message will be moved to the poison queue
    // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue#trigger---poison-messages
    context.log.error('prepareCheck: message failed validation')
    context.done(error)
    return
  }

  const preparedCheck = {
    partitionKey: prepareCheckMessage.schoolPin,
    rowKey: prepareCheckMessage.pupilPin,
    checkCode: prepareCheckMessage.pupil.checkCode,
    checkFormAllocationId: prepareCheckMessage.pupil.checkFormAllocationId,
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
    hasCheckStarted: false,
    createdAt: new Date(), // This ought to work but doesn't: {'_': new Date(), '$': 'Edm.DateTime'},
    updatedAt: new Date()
  }

  const outputProp = 'data'

  // Happy path - write to Table Storage
  context.log('prepareCheck: saving to table storage: ', preparedCheck)
  context.bindings[outputProp] = []
  context.bindings[outputProp].push(preparedCheck)
  context.done()
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
