'use strict'

const sqlService = require('./sql.service')
const R = require('ramda')

const settingDataService = {}

settingDataService.sqlFindOne = async () => {
  const sql = 'SELECT TOP 1 * FROM Settings'
  const result = await sqlService.query(sql)
  return R.head(result)
}

module.exports = settingDataService
