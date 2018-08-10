'use strict'

const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const pupilLogonEvent = {}

pupilLogonEvent.sqlCreate = async function (data) {
  return sqlService.create('[pupilLogonEvent]', data)
}

module.exports = monitor('pupilLogonEvent.data-service', pupilLogonEvent)
