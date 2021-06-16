'use strict'

const sqlService = require('./sql.service')
const R = require('ramda')
const axios = require('axios').default
const config = require('../../config')

const functionUrl = `${config.Functions.Throttled.BaseAdminUrl}${config.Functions.Throttled.SyncResultsInitPath}`
const requestConfig = {
  headers: {
    'x-functions-key': config.Functions.Throttled.AuthKey,
    'Content-Type': 'application/json'
  }
}

const service = {
  getSchoolUuidByCheckCode: async function getSchoolUuidByCheckCode (checkCode) {
    const params = [
      {
        name: 'checkCode',
        type: sqlService.TYPES.UniqueIdentifier,
        value: checkCode
      }
    ]
    const sql = `
      SELECT s.urlSlug FROM mtc_admin.[check] chk
        INNER JOIN mtc_admin.[pupil] p ON chk.pupil_id = p.id
        INNER JOIN mtc_admin.[school] s ON p.school_id = s.id
      WHERE chk.checkCode = @checkCode`
    const result = await sqlService.query(sql, params)
    return R.head(result)
  },

  callSyncResultsInitFunction: async function callSyncResultsInitFunction (message) {
    const response = await axios.post(functionUrl, message, requestConfig)
    if (response.status !== 200) {
      throw new Error('functions api call failed')
    }
  }
}

module.exports = service
