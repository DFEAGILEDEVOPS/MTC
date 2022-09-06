'use strict'

const sqlService = require('../data-access/sql.service')
const { TYPES } = require('./sql.service')

const settingLogDataService = {}

/**
 * Create a new settingLog record in the DB
 * @param loadingTimeLimit number to 2 decimal places
 * @param questionTimeLimit number to 2 decimal places
 * @param checkTimeLimit number
 * @param isPostAdminEndDateUnavailable boolean
 * @param userId
 * @return {Promise.<*>}
 */
settingLogDataService.sqlCreate = async function (loadingTimeLimit, questionTimeLimit, checkTimeLimit, isPostAdminEndDateUnavailable, userId) {
  const sql = `
    INSERT [mtc_admin].[settingsLog] (
      loadingTimeLimit,
      questionTimeLimit,
      checkTimeLimit,
      isPostAdminEndDateUnavailable,
      user_id
    ) VALUES (
      @loadingTimeLimit,
      @questionTimeLimit,
      @checkTimeLimit,
      @isPostAdminEndDateUnavailable,
      @userId
    )`
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
    },
    {
      name: 'isPostAdminEndDateUnavailable',
      value: isPostAdminEndDateUnavailable,
      type: TYPES.Bit
    }
  ]
  return sqlService.modify(sql, params)
}

module.exports = settingLogDataService
