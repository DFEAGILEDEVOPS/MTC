'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

const settingDataService = {}

settingDataService.sqlFindOne = async () => {
  const sql = 'SELECT TOP 1 * FROM Settings'
  const result = await sqlService.query(sql)
  return R.head(result)
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
      scale: 2,
      precision: 5
    },
    {
      name: 'questionTimeLimit',
      value: questionTimeLimit,
      type: TYPES.Decimal,
      scale: 2,
      precision: 5
    }
  ]
  return sqlService.modify(sql, params)
}

module.exports = settingDataService
