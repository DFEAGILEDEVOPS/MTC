'use strict'

let completeCheckDataService = null
const config = require('../config')

switch (config.StorageProvider) {
  case 'TableStorage':
    completeCheckDataService = require('./data-access/complete-check.data.service.azure-table')
    break
  case 'MongoOfficial':
    completeCheckDataService = require('./data-access/complete-check.data.service.mongo-official')
    break
  case 'Mongoose':
    completeCheckDataService = require('./data-access/complete-check.data.service.mongoose')
    break
  case 'QueueService':
    completeCheckDataService = require('./data-access/complete-check.data.service.azure-queue')
    break
  default:
    throw new Error('Unsupported Storage Provider:', config.StorageProvider)
}

const completeCheckService = {}

completeCheckService.submitCheck = async function (data) {
  // Timestamp the request
  data.receivedByServerAt = Date.now()
  // persist to data store
  await completeCheckDataService.create(data)
}

module.exports = completeCheckService
