'use strict'

const completeCheckDataService = require('./data-access/complete-check.data.service')
const completeCheckService = {}

completeCheckService.submitCheck = async function (data) {
  // Timestamp the request
  data.receivedByServerAt = Date.now()

  // store to data store
  await completeCheckDataService.create(data)
}

module.exports = completeCheckService
