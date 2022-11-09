const sb = require('@azure/service-bus')
const config = require('../../../config')
const jobService = require('../../job-service/job.service')

let sbClient
let sbQueueSender

interface IncomingMessage {
  requestedBy: string
  dateTimeRequested: moment.Moment
  jobUuid: string
}

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

  const jobUuid = await jobService.

  await sbQueueSender.sendMessages({
    body: {
      requestedBy: currentUsername,
      version: 1
    }
  })
}

preparedCheckSyncService.addMessages = triggerPsReport

module.exports = preparedCheckSyncService
