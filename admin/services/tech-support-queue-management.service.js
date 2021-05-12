'use strict'

const serviceBusQueueMetadataService = require('./data-access/service-bus-queue-metadata.service')
const storageQueueMetadataService = require('./data-access/storage-queue-metadata.service')
const R = require('ramda')

const service = {
  getServiceBusQueueSummary: async function getServiceBusQueueSummary () {
    return serviceBusQueueMetadataService.getAllQueueMessageCounts()
  },

  getStorageAccountQueueSummary: async function getStorageAccountQueueSummary () {
    const queueInfo = await storageQueueMetadataService.getAllQueueMessageCounts()
    if (!queueInfo) return []
    const poisonQueues = queueInfo.filter(q => q.result.name.endsWith('-poison'))
    const mainQueues = queueInfo.filter(q => !q.result.name.endsWith('-poison'))
    const toReturn = []
    for (let index = 0; index < mainQueues.length; index++) {
      const q = mainQueues[index]
      const poisonQCount = findPoisonQueueCount(q.result.name, poisonQueues)
      toReturn.push({
        name: q.result.name,
        activeMessageCount: q.result.approximateMessageCount,
        deadLetterCount: poisonQCount
      })
    }
    return toReturn
  }
}

function findPoisonQueueCount (queueName, queueInfo) {
  const poisonQueueName = `${queueName}-poison`
  const queue = R.find((q) => q.result.name === poisonQueueName, queueInfo)
  if (!queue) return 0
  return queue.result.approximateMessageCount
}

module.exports = service
