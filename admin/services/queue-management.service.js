'use strict'

const serviceBusQueueAdminService = require('./data-access/service-bus-queue-admin.data.service')
const storageQueueMetadataService = require('./data-access/azure-queue.data.service')
const R = require('ramda')

const service = {
  getServiceBusQueueSummary: async function getServiceBusQueueSummary () {
    return serviceBusQueueAdminService.getAllQueueMessageCounts()
  },

  getStorageAccountQueueSummary: async function getStorageAccountQueueSummary () {
    const queueInfo = await storageQueueMetadataService.getAllQueueMessageCounts()
    if (!queueInfo) return []
    const poisonQueues = queueInfo.filter(q => q.name.endsWith('-poison'))
    const mainQueues = queueInfo.filter(q => !q.name.endsWith('-poison'))
    const toReturn = []
    for (let index = 0; index < mainQueues.length; index++) {
      const q = mainQueues[index]
      const poisonQCount = findPoisonQueueCount(q.name, poisonQueues)
      toReturn.push({
        name: q.name,
        activeMessageCount: q.approximateMessagesCount,
        deadLetterCount: poisonQCount
      })
    }
    return toReturn
  },

  clearServiceBusQueue: async function clearServiceBusQueue (queueName) {
    const activeMessageCount = await serviceBusQueueAdminService.getQueueActiveMessageCount(queueName)
    if (activeMessageCount === 0) return
    return serviceBusQueueAdminService.clearQueue(queueName, activeMessageCount)
  }
}

function findPoisonQueueCount (queueName, queueInfo) {
  const poisonQueueName = `${queueName}-poison`
  const queue = R.find((q) => q.name === poisonQueueName, queueInfo)
  if (!queue) return 0
  return queue.approximateMessagesCount
}

module.exports = service
