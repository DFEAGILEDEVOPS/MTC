'use strict'

const Setting = require('../../models/setting')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const settingDataService = {}

settingDataService.sqlFindOne = async () => {
  const sql = 'SELECT TOP 1 * FROM Settings'

  const result = await sqlService.query(sql)
  if (result && result.length > 0) {
    return result[0]
  }
  return {}
}

/**
 * Create or Update a document, depending on whether an `_id` field is present
 * @param {number} loadingTimeLimit - the loadingTime for each question
 * @param {number} questionTimeLimit - the time given for each question
 * @return {Promise.<*>} returns a sql service response object `{ rowsModified: 1 }`
 */
settingDataService.sqlUpdate = async (loadingTimeLimit, questionTimeLimit) => {
  const sql = 'UPDATE [Settings] SET loadingTimeLimit=@loadingTimeLimit, questionTimeLimit=@questionTimeLimit, updatedAt=GETUTCDATE() WHERE id=1'
  const params = [
    {
      name: 'loadingTimeLimit',
      value: loadingTimeLimit,
      type: TYPES.Decimal,
      scale: 1,
      precision: 5
    },
    {
      name: 'questionTimeLimit',
      value: questionTimeLimit,
      type: TYPES.Decimal,
      scale: 1,
      precision: 5
    }
  ]
  return sqlService.modify(sql, params)
}

/**
 * @deprecated use sqlFindOne
 * @param options
 */
settingDataService.findOne = async (options) => {
  return Setting.findOne(options).lean().exec()
}

/**
 * Create or Update a document, depending on whether an `_id` field is present
 * @param doc
 * @return {Promise.<*>} returns a mongo response doc `{ n: 1, nModified: 1, ok: 1 }`
 */
settingDataService.createOrUpdate = async function (doc) {
  return Setting.update({_id: doc._id}, doc, {upsert: true}).exec()
}

module.exports = settingDataService
