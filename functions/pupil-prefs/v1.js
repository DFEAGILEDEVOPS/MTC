'use strict'

const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

const moment = require('moment')
const uuid = require('uuid/v4')

const accessArrangementsTable = '[accessArrangements]'
const azureStorageHelper = require('../lib/azure-storage-helper')
const checkTable = '[check]'
const pupilAccessArrangementsTable = '[pupilAccessArrangements]'
const pupilFontSizesTable = '[pupilFontSizes]'
const pupilColourContrastsTable = '[pupilColourContrasts]'
const pupilTable = '[pupil]'
const schema = '[mtc_admin]'

const v1 = {}

v1.process = async function (context, pupilPrefsMessage) {
  const { checkCode, preferences } = pupilPrefsMessage
  const { fontSizeCode, colourContrastCode } = preferences
  context.log('pupil-prefs: message received', checkCode, fontSizeCode, colourContrastCode)

  // Update pupil access arrangements preference based on code presence in the payload
  try {
    if (fontSizeCode) {
      await v1.updatePupilAccessArrangementsPreference(checkCode, 'pupilfontSizes_id', pupilFontSizesTable, fontSizeCode, 'FTS')
      context.log(`pupil-prefs: SUCCESS: pupil access arrangement row updated for checkCode ${checkCode} and font size code ${fontSizeCode}`)
    }
    if (colourContrastCode) {
      await v1.updatePupilAccessArrangementsPreference(checkCode, 'pupilColourContrasts_id', pupilColourContrastsTable, colourContrastCode, 'CCT')
      context.log(`pupil-prefs: SUCCESS: pupil access arrangement row updated for checkCode ${checkCode} and colour contrast code ${fontSizeCode}`)
    }
  } catch (error) {
    const codeValue = fontSizeCode || colourContrastCode
    context.log.error(`pupil-prefs: ERROR: unable to update pupil access arrangement row for ${checkCode} and code value ${codeValue}`)
    throw error
  }

  const preparedCheckSyncQueueName = 'prepared-check-sync'
  const message = { version: 1, checkCode: checkCode }
  await azureStorageHelper.addMessageToQueue(preparedCheckSyncQueueName, message)

  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: checkCode,
    RowKey: uuid(),
    eventType: 'pupil-preferences',
    payload: JSON.stringify(pupilPrefsMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)
}

/**
 * Update relevant pupil access arrangement preference
 * @param {String} checkCode - the unique GUID that identifies the check in the admin DB
 * @param {String} prefField - pupil access arrangement preference field (font size or colour contrast)
 * @param {String} prefTable - reference table to match id
 * @param {String} prefCode - code value to be matched with reference table
 * @param {String} accessArrangementCode - code value for relevant access arrangement
 * @return {Promise<void>}
 */
v1.updatePupilAccessArrangementsPreference = async function (checkCode, prefField, prefTable, prefCode, accessArrangementCode) {
  const sql = `UPDATE ${schema}.${pupilAccessArrangementsTable}
               SET ${prefField} = (
                SELECT id FROM ${schema}.${prefTable}
                WHERE code = @prefCode
               )
               WHERE pupil_Id = (
                  SELECT p.id FROM ${schema}.${pupilTable} p
                  INNER JOIN ${schema}.${checkTable} chk
                  ON chk.pupil_id = p.id
                  WHERE chk.checkCode = @checkCode
               ) AND accessArrangements_id = (
                  SELECT id FROM ${schema}.${accessArrangementsTable}
                  WHERE code = @accessArrangementCode
               )`

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    },
    {
      name: 'prefCode',
      value: prefCode,
      type: TYPES.Char
    },
    {
      name: 'accessArrangementCode',
      value: accessArrangementCode,
      type: TYPES.Char
    }
  ]
  return sqlService.modify(sql, params)
}

module.exports = v1
