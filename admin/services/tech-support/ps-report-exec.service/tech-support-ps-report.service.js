const sb = require('@azure/service-bus')
const config = require('../../../config')
// const jobService = require('../../job-service/job.service')

let sbClient
let sbQueueSender

const preparedCheckSyncService = {}

/**
 *
 * @param {number} currentUserId
 */
const triggerPsReport = async (currentUserId) => {
  if (!sbClient || !sbQueueSender) {
    sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
    sbQueueSender = sbClient.createSender('ps-report-exec')
  }

  // TODO const jobUuid = await jobService.

  await sbQueueSender.sendMessages({
    body: {
      requestedBy: 'currentUsername looked up from db',
      version: 1
    }
  })
}

preparedCheckSyncService.addMessages = triggerPsReport

module.exports = preparedCheckSyncService
