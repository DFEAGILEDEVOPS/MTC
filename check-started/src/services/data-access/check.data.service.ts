'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const table = '[check]'

const checkDataService = {
  /**
   * Update the check, setting the startedAt field
   * @param checkCode
   * @param startedAt
   * @return {Promise}
   */
  sqlUpdateCheckStartedAt: async (checkCode, startedAt) => {
    const sql = `UPDATE ${sqlService.adminSchema}.${table} SET startedAt=@startedAt WHERE checkCode=@checkCode AND startedAt IS NULL`
    const params = [
      {
        name: 'startedAt',
        value: startedAt,
        type: TYPES.DateTimeOffset
      },
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    return sqlService.modify(sql, params)
  }
}

export = checkDataService
