'use strict'

const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES
const R = require('ramda')
const roles = require('../../lib/consts/roles')

const service = {
  getByCheckCode: async function getByCheckCode (checkCode) {
    const sql = 'SELECT * FROM mtc_admin.vewCheckDiagnostic WHERE checkCode=@checkCode'
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    const result = await sqlService.query(sql, params, undefined, roles.techSupport)
    return R.head(result)
  }
}

module.exports = service
