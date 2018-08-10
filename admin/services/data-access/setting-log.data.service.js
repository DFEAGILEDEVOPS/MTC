'use strict'

const sqlService = require('../data-access/sql.service')
const TYPES = require('tedious').TYPES
const monitor = require('../../helpers/monitor')

const settingLogDataService = {}

/**
 * Create a new settingLog record in the DB
 * @param loadingTimeLimit number to 2 decimal places
 * @param questionTimeLimit number to 2 decimal places
 * @param userId
 * @return {Promise.<*>}
 */
settingLogDataService.sqlCreate = async function (loadingTimeLimit, questionTimeLimit, userId) {
  const sql = `INSERT ${sqlService.adminSchema}.[settingsLog] (loadingTimeLimit, questionTimeLimit, user_id) 
  VALUES (@loadingTimeLimit, @questionTimeLimit, @userId)`
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
      name: 'userId',
      value: userId,
      type: TYPES.Int
    }
  ]
  return sqlService.modify(sql, params)
}

module.exports = monitor('settingLog.data-service', settingLogDataService)
