'use strict'

const payloadDataService = require('./data-access/payload.data.service')

const payloadService = {
  getPayload: async function getPayload (checkCode) {
    if (!checkCode) {
      throw new Error('Missing checkCode')
    }
    return payloadDataService.sqlFindOneByCheckCode(checkCode)
  }
}

module.exports = payloadService
