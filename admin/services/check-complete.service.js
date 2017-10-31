'use strict'

const completedChecksDataService = require('./data-access/completed-check.data.service')
const checkCompleteService = {}
const markingService = require('./marking.service')

checkCompleteService.completeCheck = async function (data) {
  // Timestamp the request
  data.receivedByServerAt = Date.now()

  // store to data store
  await completedChecksDataService.create(data)
  await markingService.mark(data)
}

module.exports = checkCompleteService
