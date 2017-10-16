'use strict'

// const azureService = require('./azure-storage.service')
const azureStorage = require('azure-storage')
const completedCheckDataService = {}
const queueName = 'completedchecks'
/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
completedCheckDataService.create = (data) => new Promise((resolve, reject) => {
  var message = Buffer.from(JSON.stringify(data)).toString('base64')
  // TODO - can we optimise this by newing up only once in service?
  const queueService = azureStorage.createQueueService()
  queueService.createMessage(queueName, message, function (error, result, response) {
    if (error) {
      console.log('queue submission error:', error)
      return reject(error)
    }
    return resolve({ result, response })
  })
})

module.exports = completedCheckDataService
