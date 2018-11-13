'use strict'

const sqlService = require('less-tedious')
const { TYPES } = require('tedious')

const v1 = {
  /**
   * Update the SQL DB with the pupil login datetime
   * Message originates from the pupil-api
   * @param {string} checkCode - check GUID
   * @param {string} loginDatetime - string Datetime
   * @return {Promise<void>}
   */
  process: async function sqlUpdateLoginTimestamp (checkCode, loginDatetime) {
    const loginDate = new Date(loginDatetime)
    const sql = `UPDATE [mtc_admin].[check]
               SET pupilLoginDate = @loginDate
               WHERE checkCode = @checkCode`
    const params = [
      { name: 'loginDate', value: loginDate, type: TYPES.DateTimeOffset },
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]

    return sqlService.modify(sql, params)
  }
}

module.exports = v1
