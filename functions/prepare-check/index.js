const R = require('ramda')

/**
 * Write to Table Storage for fast pupil authentication
 * Reads from a queue
 * @param context
 * @param {} prepareCheckMessage
 */
module.exports = function (context, prepareCheckMessage) {
  context.log.verbose('prepareCheck, got message from prepare-check queue', prepareCheckMessage)

  try {
    validateMessage(prepareCheckMessage)
  } catch (error) {
    context.done(error)
    return
  }

  context.bindings.preparedCheckTable = []

  const preparedCheck = {
    partitionKey: prepareCheckMessage.schoolPin,
    rowKey: prepareCheckMessage.pupilPin,
    checkCode: prepareCheckMessage.pupil.checkCode,
    questions: prepareCheckMessage.questions,
    pupil: prepareCheckMessage.pupil,
    school: prepareCheckMessage.school,
    config: prepareCheckMessage.config,
    tokens: {
      sasToken: prepareCheckMessage.sasToken,
      jwtToken: prepareCheckMessage.jwtToken
    },
    isCollected: false,
    collectedAt: null,
    hasCheckStarted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Happy path - write to Table Storage
  context.log('prepareCheck: saving to table storage: ', preparedCheck)
  context.bindings.preparedCheckTable.push(preparedCheck)
  context.done()
}

function validateMessage (message) {
  const check = (prop) => { if (R.not(R.has(prop, message))) { throw new Error(`Message failed validation check: missing field: ${prop}`) } }
  const topLevelProperties = ['schoolPin', 'pupilPin', 'pupil', 'school', 'sasToken', 'jwtToken', 'config']
  topLevelProperties.map(check)
  validatePupil(message.pupil)
  validateQuestions(message.questions)
  validateSchool(message.school)
  validateConfig(message.config)
  return true
}

function validatePupil (pupil) {
  const pupilProperties = ['firstName', 'lastName', 'dob', 'checkCode']
  schemaValidator(pupil, pupilProperties, 'pupil')
  return true
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
  return true
}

function validateSchool (school) {
  const schoolProperties = ['id', 'name']
  schemaValidator(school, schoolProperties, 'school')
  return true
}

function validateConfig (config) {
  const configProperties = ['questionTime', 'loadingTime', 'speechSynthesis']
  schemaValidator(config, configProperties, 'config')
  return true
}

function schemaValidator (obj, requiredPropertyList, name = 'schema') {
  const check = (prop) => { if (R.not(R.has(prop, obj))) { throw new Error(`Missing ${name} field: ${prop}`) } }
  if (R.not(R.is(Object, obj))) {
    throw new Error(`${name} is not an object`)
  }
  requiredPropertyList.map(check)
  return true
}
