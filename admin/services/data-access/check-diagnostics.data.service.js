'use strict'

const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES
const R = require('ramda')

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
    const result = await sqlService.readonlyQuery(sql, params)
    return R.head(result)
  }
}

module.exports = service
