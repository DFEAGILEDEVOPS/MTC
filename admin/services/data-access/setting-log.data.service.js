'use strict'

const sqlService = require('../data-access/sql.service')
const TYPES = require('tedious').TYPES

const settingLogDataService = {}

/**
 * Create a new settingLog record in the DB
 * @param loadingTimeLimit number to 2 decimal places
 * @param questionTimeLimit number to 2 decimal places
 * @param checkTimeLimit number
 * @param userId
 * @return {Promise.<*>}
 */
settingLogDataService.sqlCreate = async function (loadingTimeLimit, questionTimeLimit, checkTimeLimit, userId) {
  const sql = `INSERT ${sqlService.adminSchema}.[settingsLog] (loadingTimeLimit, questionTimeLimit, checkTimeLimit, user_id) 
  VALUES (@loadingTimeLimit, @questionTimeLimit, @checkTimeLimit, @userId)`
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
    },
    {
      name: 'checkTimeLimit',
      value: checkTimeLimit,
      type: TYPES.Int
    },
    {
      name: 'userId',
      value: userId,
      type: TYPES.Int
    }
  ]
  return sqlService.modify(sql, params)
}

module.exports = settingLogDataService
