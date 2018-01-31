'use strict'

const sqlService = require('./sql.service')

const service = {
  sqlCreate: async (logonData) => {
    return sqlService.create('[ncaToolsSession]', logonData)
  }
}

module.exports = service
