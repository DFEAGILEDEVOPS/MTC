'use strict'

const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const adminLogonEventDataService = {}
const table = '[adminLogonEvent]'

adminLogonEventDataService.sqlCreate = async function (data) {
  return sqlService.create(table, data)
}

module.exports = monitor('adminLogonEvent.data-service', adminLogonEventDataService)
