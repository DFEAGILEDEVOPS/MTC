import * as azure from 'azure-storage'
import logger from './log.service'

let azureQueueService // cache the queueService for repeated use

export function addMessage (queueName: string, payload: object, queueService?: any) {
  if (queueName.length < 1) {
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
      logger.error(`Error injecting message into queue [${queueName}]: ${error.message}`)
      logger.error(error)
    }
  })
}
