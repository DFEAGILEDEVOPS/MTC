'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')

const payloadDataService = {
  sqlFindOneByCheckCode: async function sqlFindOneByCheckCode (checkCode) {
    const sql = `select cr.payload 
                 from [mtc_admin].[check] chk 
                 join [mtc_admin].[checkResult] cr on chk.id = cr.check_id
                 where chk.checkCode = @checkCode`
    const params = [
      { name: 'checkCode', value: checkCode, type: sqlService.TYPES.UniqueIdentifier }
    ]
    const res = await sqlService.query(sql, params)
    return JSON.parse(R.prop('payload', R.head(res)))
  }
}

module.exports = payloadDataService
