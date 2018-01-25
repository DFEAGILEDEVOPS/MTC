'use strict'

const sqlService = require('./sql.service')

const adminLogonEventDataService = {}
const table = '[adminLogonEvent]'

adminLogonEventDataService.sqlCreate = async function (data) {
  return sqlService.create(table, data)
}

module.exports = adminLogonEventDataService
