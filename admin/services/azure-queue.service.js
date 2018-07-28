const azure = require('azure-storage')
const queueService = azure.createQueueService()
const winston = require('winston')

module.exports.addMessage = function addMessage (queueName, payload, queueService = queueService) {
  if (queueName === null || queueName.length < 1) {
    throw new Error('Missing queueName')
  }

  const message = JSON.stringify(payload)
  // var encodedMessage = encoder.encode(message)
  queueService.createMessage(queueName, message, function (error, result, response) {
    if (error) {
      winston.error(`Error injecting message into queue [${queueName}]: ${error.message}`)
      winston.error(error)
    }
  })
}
