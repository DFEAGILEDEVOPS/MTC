'use strict'

const completeCheckDataService = require('./data-access/complete-check.data.service.2')
const completeCheckService = {}

completeCheckService.submitCheck = async function (data) {
  // Timestamp the request
  data.receivedByServerAt = Date.now()
  // persist to data store
  await completeCheckDataService.create(data)
}

module.exports = completeCheckService
