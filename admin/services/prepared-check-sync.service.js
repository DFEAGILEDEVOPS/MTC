const sb = require('@azure/service-bus')
const config = require('../config')

let sbClient
let sbQueueClient
let sbQueueSender

const preparedCheckSyncService = {}

const addMessageToServiceBus = async (pupilUrlSlug) => {
  if (!sbClient || !sbQueueClient || !sbQueueSender) {
    sbClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.connectionString)
    sbQueueClient = sbClient.createQueueClient('check-sync')
    sbQueueSender = sbQueueClient.createSender()
  }

  await sbQueueSender.send({
    body: {
      pupilUUID: pupilUrlSlug,
      version: 1
    }
  })
}

preparedCheckSyncService.addMessages = addMessageToServiceBus

module.exports = preparedCheckSyncService
