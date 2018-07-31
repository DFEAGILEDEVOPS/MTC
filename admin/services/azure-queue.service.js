'use strict'

const azure = require('azure-storage')
const azureQueueService = azure.createQueueService()
const winston = require('winston')

module.exports.addMessage = function addMessage (queueName, payload, queueService = azureQueueService) {
  if (queueName === null || queueName.length < 1) {
    throw new Error('Missing queueName')
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
