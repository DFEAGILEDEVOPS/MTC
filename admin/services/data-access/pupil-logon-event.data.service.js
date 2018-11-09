'use strict'

const sqlService = require('./sql.service')

const pupilLogonEvent = {}

pupilLogonEvent.sqlCreate = async function (data) {
  return sqlService.create('[pupilLogonEvent]', data)
}

module.exports = pupilLogonEvent
