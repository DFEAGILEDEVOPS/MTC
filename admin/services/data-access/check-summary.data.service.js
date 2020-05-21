'use strict'

const sqlService = require('./sql.service')
const TYPES = require('./sql.service').TYPES
const roles = require('../../lib/consts/roles')
const R = require('ramda')

const service = {
  /**
   * @description retrieves a single check summary from sql db
   * @param {string} checkCode - uuid of the check to retrieve
   * @returns {Promise.<object>}
   */
  getSummary: async function getSummary (checkCode) {
    const sql = 'SELECT * FROM vewCheckDiagnostic WHERE checkCode = @checkCode'
    const params = [
      {
        name: 'checkCode',
        type: TYPES.UniqueIdentifier,
        value: checkCode
      }
    ]
    const result = await sqlService.query(sql, params, undefined, roles.techSupport)
    return R.head(result)
  }
}

module.exports = service
