const sb = require('@azure/service-bus')
const config = require('../config')

const sbClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.connectionString)
const sbQueueClient = sbClient.createQueueClient('check-sync')
const sbQueueSender = sbQueueClient.createSender()

const preparedCheckSyncService = {}

const addMessageToRedis = async (pupilUrlSlug) => {
  await sbQueueSender.send({
    body: {
      pupilUUID: pupilUrlSlug,
      version: 1
    }
  })
}

preparedCheckSyncService.addMessages = addMessageToRedis

module.exports = preparedCheckSyncService
