'use strict'

const completedChecksDataService = require('./data-access/completed-check.data.service')
const checkCompleteService = {}

checkCompleteService.completeCheck = async function (data) {
  // Timestamp the request
  data.receivedByServerAt = Date.now()

  // store to data store
  await completedChecksDataService.create(data)
}

module.exports = checkCompleteService
