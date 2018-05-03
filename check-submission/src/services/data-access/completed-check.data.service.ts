'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

const completedCheckDataService = {
  /**
   * Updates check record with results
   * @param checkCode
   * @param completedCheck the entire JSON payload submitted by the pupil
   * @param receivedByServerAt the timestamp when data was received by the server
   * @return {Promise}
   */
  sqlAddResult: async function (checkCode, completedCheck, receivedByServerAt) {
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    // TODO: Refactor to extract two DL methods from this to make it simpler
    // TODO: The error should be thrown from a service method instead
    const sql = `SELECT id FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`
    let result = await sqlService.query(sql, params)
    result = R.head(result)
    if (!result || !result.id) {
      throw new Error(`Could not find check with checkCode:${checkCode}`)
    }
    const checkId = result.id
    const checkDataParams = {
      'id': checkId,
      'data': JSON.stringify(completedCheck),
      'receivedByServerAt': receivedByServerAt
    }
    return sqlService.update('[check]', checkDataParams)
  },

  /**
   * Return a single check with the SPA data as an object
   * @param checkCode
   * @return {Promise<void>}
   */
  sqlFindOneByCheckCode: async function (checkCode) {
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    const result = await sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`, params)

    // Hydrate the JSON string in to an object
    const first = R.head(result)
    return R.assoc('data', (JSON.parse(first.data)).data, first)
  }
}

export = completedCheckDataService
