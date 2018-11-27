const moment = require('moment')
const R = require('ramda')
const uuid = require('uuid/v4')

const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
const accessArrangementsSqlUtil = require('./access-arrangements-sql-util')
const preparedCheckSchemaValidator = require('../lib/prepared-check-schema-validator')

module.exports = async function (context, preparedCheckSyncMessage) {
  const { checkCode } = preparedCheckSyncMessage
  if (!checkCode) {
    const error = new Error('prepared-check-sync: checkCode not present')
    context.log.error(error.message)
    throw error
  }
  context.log('prepared-check-sync: message received', checkCode)
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
  const newConfig = await getUpdatedConfig(preparedCheck.config, pupilAccessArrangements, context)
  preparedCheckSchemaValidator.validateConfig(newConfig)
  const preparedCheckTable = 'preparedCheck'
  const updatedEntity = {
    PartitionKey: preparedCheck.PartitionKey,
    RowKey: preparedCheck.RowKey,
    config: JSON.stringify(newConfig)
  }
  await azureTableService.insertOrMergeEntityAsync(preparedCheckTable, updatedEntity, null)
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

async function getUpdatedConfig (preparedCheckConfig, pupilAccessArrangements, context) {
  const newCheckConfig = JSON.parse(preparedCheckConfig)
  let AAConfig = {
    audibleSounds: false,
    inputAssistance: false,
    numpadRemoval: false,
    fontSize: false,
    colourContrast: false,
    questionReader: false
  }
  if (!pupilAccessArrangements || pupilAccessArrangements.length === 0) {
    return R.merge(newCheckConfig, AAConfig)
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
    if (code === accessArrangementsSqlUtil.AACODES.AUDIBLE_SOUNDS) AAConfig.audibleSounds = true
    if (code === accessArrangementsSqlUtil.AACODES.INPUT_ASSISTANCE) AAConfig.inputAssistance = true
    if (code === accessArrangementsSqlUtil.AACODES.NUMPAD_REMOVAL) AAConfig.numpadRemoval = true
    if (code === accessArrangementsSqlUtil.AACODES.FONT_SIZE) {
      AAConfig.fontSize = true
    }
    if (fontSizeAccessArrangement && fontSizeAccessArrangement.pupilFontSizeCode) {
      AAConfig.fontSizeCode = fontSizeAccessArrangement.pupilFontSizeCode
    }
    if (code === accessArrangementsSqlUtil.AACODES.COLOUR_CONTRAST) {
      AAConfig.colourContrast = true
    }
    if (colourContrastAccessArrangement && colourContrastAccessArrangement.colourContrastCode) {
      AAConfig.colourContrastCode = colourContrastAccessArrangement.colourContrastCode
    }
    if (code === accessArrangementsSqlUtil.AACODES.QUESTION_READER) AAConfig.questionReader = true
  })
  return R.merge(newCheckConfig, AAConfig)
}
