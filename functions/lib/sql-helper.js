'use strict'

const R = require('ramda')
const sqlService = require('less-tedious')

const checkTable = '[check]'
const { TYPES } = require('tedious')
const schema = '[mtc_admin]'
const config = require('../config')
sqlService.initialise(config)

/**
 * Retrieve the checkFormAllocation data from the db
 * @param checkCode
 * @return {Promise<object>}
 */
module.exports.sqlFindCheckByCheckCode = async function (checkCode) {
  const sql = `SELECT TOP 1 chk.* , cs.code
               FROM ${schema}.${checkTable} chk JOIN 
                    ${schema}.[checkStatus] cs ON (chk.checkStatus_id = cs.id) 
               WHERE checkCode = @checkCode`
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const res = await sqlService.query(sql, params)
  return R.head(res)
}
