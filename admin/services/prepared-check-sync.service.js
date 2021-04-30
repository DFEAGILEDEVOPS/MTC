const sb = require('@azure/service-bus')
const config = require('../config')

let sbClient
let sbQueueSender

const preparedCheckSyncService = {}

const addMessageToServiceBus = async (pupilUrlSlug) => {
  if (!sbClient || !sbQueueSender) {
    sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
    sbQueueSender = sbClient.createSender('check-sync')
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
