'use strict'

const serviceBusQueueMetadataService = require('./data-access/service-bus-queue-metadata.service')
const storageQueueMetadataService = require('./data-access/storage-queue-metadata.service')

const service = {
  getServiceBusQueueSummary: async function getServiceBusQueueSummary () {
    return serviceBusQueueMetadataService.getAllQueueMessageCounts()
  },

  getStorageAccountQueueSummary: async function getStorageAccountQueueSummary () {
    // TODO merge poison queue counts with main queue entries
    const queueInfo = await storageQueueMetadataService.getAllQueueMessageCounts()
    return queueInfo.map(q => {
      return {
        name: q.result.name,
        activeMessageCount: q.result.approximateMessageCount,
        deadLetterCount: 999
      }
    })
  }
}

module.exports = service
