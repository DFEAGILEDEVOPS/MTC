'use strict'

const azure = require('azure-storage')
const winston = require('winston')
let azureQueueService // cache the queueService for repeated use

module.exports.addMessage = function addMessage (queueName, payload, queueService) {
  if (queueName === null || queueName.length < 1) {
    throw new Error('Missing queueName')
  }

  if (!queueService) {
    // If we have not been provided with a queueService, assume we want an Azure one.
    if (!azureQueueService) {
      azureQueueService = azure.createQueueService()
    }
    queueService = azureQueueService
  }

  const message = JSON.stringify(payload)
  const encodedMessage = Buffer.from(message).toString('base64')
  queueService.createMessage(queueName, encodedMessage, function (error, result, response) {
    if (error) {
      winston.error(`Error injecting message into queue [${queueName}]: ${error.message}`)
      winston.error(error)
    }
  })
}
