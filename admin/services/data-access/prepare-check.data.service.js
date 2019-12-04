'use strict'
const sqlService = require('./sql.service')

const service = {
  /**
   * Lookup checkCodes from check IDs
   * @param {Number[]}checkIds
   * @return {Promise<String[]>}
   */
  getCheckCodes: async (checkIds) => {
    const { params, paramIdentifiers } = sqlService.buildParameterList(checkIds, sqlService.TYPES.Int)
    const sql = `SELECT checkCode 
                 FROM [mtc_admin].[check]
                 WHERE id IN (${paramIdentifiers.join(' , ')})`
    const res = await sqlService.query(sql, params)
    const checkCodes = res.map(c => c.checkCode)
    return checkCodes
  }
}

module.exports = service
