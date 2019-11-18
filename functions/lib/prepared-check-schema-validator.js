const R = require('ramda')

const preparedCheckSchemaValidator = {}

preparedCheckSchemaValidator.validateMessage = function (message) {
  const check = (prop) => { if (R.not(R.has(prop, message))) { throw new Error(`Message failed validation check: missing field: ${prop}`) } }
  const topLevelProperties = ['schoolPin', 'pupilPin', 'pupil', 'school', 'tokens', 'config', 'questions']
  topLevelProperties.map(check)
  preparedCheckSchemaValidator.validatePupil(message.pupil)
  preparedCheckSchemaValidator.validateQuestions(message.questions)
  preparedCheckSchemaValidator.validateSchool(message.school)
  preparedCheckSchemaValidator.validateConfig(message.config)
}

preparedCheckSchemaValidator.validatePupil = function (pupil) {
  const pupilProperties = ['firstName', 'firstNameAlias', 'lastName', 'lastNameAlias', 'dob', 'checkCode']
  preparedCheckSchemaValidator.schemaValidator(pupil, pupilProperties, 'pupil')
}

preparedCheckSchemaValidator.validateQuestions = function (questions) {
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

preparedCheckSchemaValidator.validateSchool = function (school) {
  const schoolProperties = ['id', 'name']
  preparedCheckSchemaValidator.schemaValidator(school, schoolProperties, 'school')
}

preparedCheckSchemaValidator.validateConfig = function (config) {
  const configProperties = [
    'questionTime',
    'loadingTime',
    'audibleSounds',
    'inputAssistance',
    'numpadRemoval',
    'fontSize',
    'colourContrast',
    'questionReader'
  ]
  preparedCheckSchemaValidator.schemaValidator(config, configProperties, 'config')
}

preparedCheckSchemaValidator.schemaValidator = function (obj, requiredPropertyList, name = 'schema') {
  const check = (prop) => { if (R.not(R.has(prop, obj))) { throw new Error(`Missing ${name} field: ${prop}`) } }
  if (R.not(R.is(Object, obj))) {
    throw new Error(`${name} is not an object`)
  }
  requiredPropertyList.map(check)
}

module.exports = preparedCheckSchemaValidator
