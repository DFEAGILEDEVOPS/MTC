const azureQueueService = require('../services/azure-queue.service')
const pinGenerationDataService = require('../services/data-access/pin-generation.data.service')
const featureToggles = require('feature-toggles')
const sb = require('@azure/service-bus')
const config = require('../config')
let sbClient
let sbQueueClient
let sbQueueSender

const redisPreparedChecks = featureToggles.isFeatureEnabled('prepareChecksInRedis')

if (redisPreparedChecks) {
  sbClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.connectionString)
  sbQueueClient = sbClient.createQueueClient('check-sync')
  sbQueueSender = sbQueueClient.createSender()
}

const preparedCheckSyncService = {}

const redisEnabledBehaviour = async (pupilUrlSlug) => {
  await sbQueueSender.send({
    body: {
      pupilUUID: pupilUrlSlug,
      version: 1
    }
  })
}

const existingDefaultBehaviour = async (pupilUrlSlug) => {
  const results = await pinGenerationDataService.sqlFindActivePinRecordsByPupilUrlSlug(pupilUrlSlug)
  // Sync existing preparedCheck(s) when 1 or more active pins exist
  if (results.length > 0) {
    const checkCodes = results.map(r => r.checkCode)
    for (const checkCode of checkCodes) {
      await azureQueueService.addMessageAsync('prepared-check-sync', { version: 1, checkCode: checkCode })
    }
  }
}

preparedCheckSyncService.addMessages = redisPreparedChecks ? redisEnabledBehaviour : existingDefaultBehaviour

module.exports = preparedCheckSyncService
