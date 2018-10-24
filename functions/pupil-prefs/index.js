'use strict'

const moment = require('moment')
const sqlService = require('less-tedious')
const { TYPES } = require('tedious')
const uuid = require('uuid/v4')
const winston = require('winston')

const config = require('../config')
const accessArrangementsTable = '[accessArrangements]'
const checkTable = '[check]'
const pupilAccessArrangementsTable = '[pupilAccessArrangements]'
const pupilFontSizesTable = '[pupilFontSizes]'
const pupilColourContrastsTable = '[pupilColourContrasts]'
const pupilTable = '[pupil]'
const schema = '[mtc_admin]'

winston.level = 'error'
sqlService.initialise(config)

module.exports = async function (context, pupilPrefsMessage) {
  const { checkCode, preferences } = pupilPrefsMessage
  const { fontSizeCode, colourContrastCode } = preferences
  context.log('pupil-preferences message received', checkCode)
  // TODO: purpose: process pupil preferences messages and put into pupilEvents table

  // Update pupil access arrangements preference based on code presence in the payload
  if (fontSizeCode) {
    await updatePupilAccessArrangementsPreference(checkCode, 'pupilfontSizes_id', pupilFontSizesTable, fontSizeCode, 'FTS', context.log)
  }
  if (colourContrastCode) {
    await updatePupilAccessArrangementsPreference(checkCode, 'pupilColourContrasts_id', pupilColourContrastsTable, colourContrastCode, 'CCT', context.log)
  }
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
 * @param {Function} logger
 * @return {Promise<void>}
 */
async function updatePupilAccessArrangementsPreference (checkCode, prefField, prefTable, prefCode, accessArrangementCode, logger) {
  const sql = `UPDATE ${schema}.${pupilAccessArrangementsTable}
               SET ${prefField} = (
                SELECT id FROM ${schema}.${prefTable} 
                WHERE code = @prefCode
               )                
               WHERE pupil_Id = (
                  SELECT p.id FROM ${schema}.${pupilTable} p
                  LEFT JOIN ${schema}.${checkTable} chk
                  ON chk.pupil_id= p.id
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
  try {
    const res = await sqlService.modify(sql, params)
    if (res.rowsModified === 0) {
      logger(`pupil-prefs: updatePupilAccessArrangements(): no rows modified.  This may be a bad checkCode: ${checkCode} or ${prefTable} code: ${prefCode}`)
    }
  } catch (error) {
    logger(`pupil-prefs: updatePupilAccessArrangements(): failed to update the SQL DB for ${checkCode} and ${prefTable} with code ${prefCode}: ${error.message}`)
    throw error
  }
}
