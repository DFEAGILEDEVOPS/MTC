const moment = require('moment')
const R = require('ramda')
const uuid = require('uuid/v4')

const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const accessArrangementsSqlUtil = require('./access-arrangements-sql-util')
const checkDataService = require('./check.data.service')
const preparedCheckSchemaValidator = require('../lib/prepared-check-schema-validator')

const v1 = {}

v1.process = async function process (context, preparedCheckSyncMessage) {
  const { checkCode } = preparedCheckSyncMessage
  context.log('prepared-check-sync: message received', checkCode)
  const checkCodes = await checkDataService.sqlFindActiveCheckCodesByCheckCode(checkCode)
  for (let idx in checkCodes) {
    await v1.updatePreparedChecks(context, checkCodes[idx])
    context.log('prepared-check-sync: prepared check updated for check code:', checkCodes[idx])
  }
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: checkCode,
    RowKey: uuid(),
    eventType: 'prepared-check-sync',
    payload: JSON.stringify(preparedCheckSyncMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)
}

v1.updatePreparedChecks = async function (context, checkCode) {
  let preparedCheck
  try {
    preparedCheck = await azureStorageHelper.getFromPreparedCheckTableStorage(azureTableService, checkCode, context.log)
  } catch (error) {
    context.log.error(`prepared-check-sync: ERROR: unable to fetch preparedCheck from table storage for checkCode [${checkCode}]`)
    throw error
  }
  let pupilAccessArrangements
  try {
    pupilAccessArrangements = await accessArrangementsSqlUtil.sqlFindPupilAccessArrangementsByCheckCode(checkCode)
  } catch (error) {
    context.log.error(`prepared-check-sync: ERROR: unable to fetch pupil access arrangements for checkCode [${checkCode}]`)
    throw error
  }
  const newConfig = await v1.getUpdatedConfig(preparedCheck.config, pupilAccessArrangements, context)
  preparedCheckSchemaValidator.validateConfig(newConfig)
  const preparedCheckTable = 'preparedCheck'
  const updatedEntity = {
    PartitionKey: preparedCheck.PartitionKey,
    RowKey: preparedCheck.RowKey,
    config: JSON.stringify(newConfig)
  }
  await azureTableService.insertOrMergeEntityAsync(preparedCheckTable, updatedEntity, null)
}

v1.getUpdatedConfig = async function (preparedCheckConfig, pupilAccessArrangements, context) {
  const newCheckConfig = JSON.parse(preparedCheckConfig)
  if (newCheckConfig.colourContrastCode) {
    delete newCheckConfig.colourContrastCode
  }
  if (newCheckConfig.fontSizeCode) {
    delete newCheckConfig.fontSizeCode
  }
  let aaConfig = {
    audibleSounds: false,
    inputAssistance: false,
    numpadRemoval: false,
    fontSize: false,
    colourContrast: false,
    questionReader: false,
    nextBetweenQuestions: false
  }
  if (!pupilAccessArrangements || pupilAccessArrangements.length === 0) {
    return R.merge(newCheckConfig, aaConfig)
  }
  const fontSizeAccessArrangement = pupilAccessArrangements.find(aa => aa.pupilFontSizeCode)
  const colourContrastAccessArrangement = pupilAccessArrangements.find(aa => aa.pupilColourContrastCode)
  const accessArrangementsIds = pupilAccessArrangements.map(aa => aa['accessArrangements_id'])
  let pupilAccessArrangementsCodes
  try {
    pupilAccessArrangementsCodes = await accessArrangementsSqlUtil.sqlFindAccessArrangementsCodesWithIds(accessArrangementsIds)
  } catch (error) {
    context.log.error(`prepared-check-sync: ERROR: unable to fetch pupil access arrangements codes for accessArrangementsIds ${accessArrangementsIds}`)
    throw error
  }
  pupilAccessArrangementsCodes.forEach(code => {
    if (code === accessArrangementsSqlUtil.AACODES.AUDIBLE_SOUNDS) aaConfig.audibleSounds = true
    if (code === accessArrangementsSqlUtil.AACODES.INPUT_ASSISTANCE) aaConfig.inputAssistance = true
    if (code === accessArrangementsSqlUtil.AACODES.NUMPAD_REMOVAL) aaConfig.numpadRemoval = true
    if (code === accessArrangementsSqlUtil.AACODES.FONT_SIZE) {
      aaConfig.fontSize = true
    }
    if (fontSizeAccessArrangement && fontSizeAccessArrangement.pupilFontSizeCode) {
      aaConfig.fontSizeCode = fontSizeAccessArrangement.pupilFontSizeCode
    }
    if (code === accessArrangementsSqlUtil.AACODES.COLOUR_CONTRAST) {
      aaConfig.colourContrast = true
    }
    if (colourContrastAccessArrangement && colourContrastAccessArrangement.pupilColourContrastCode) {
      aaConfig.colourContrastCode = colourContrastAccessArrangement.pupilColourContrastCode
    }
    if (code === accessArrangementsSqlUtil.AACODES.QUESTION_READER) aaConfig.questionReader = true
    if (code === accessArrangementsSqlUtil.AACODES.NEXT_BETWEEN_QUESTIONS) aaConfig.nextBetweenQuestions = true
  })
  return R.merge(newCheckConfig, aaConfig)
}

module.exports = v1
