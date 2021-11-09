'use strict'

const { QueueServiceClient } = require('@azure/storage-queue')
const config = require('../config')
const connectionString = config.AzureStorage.connectionString

const service = {
  getAllQueueMessageCounts: async function getAllQueueMessageCounts () {
    const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString)
    const queueNames = await getQueueNames(queueServiceClient)
    const queueInfo = []
    for (let index = 0; index < queueNames.length; index++) {
      const queueName = queueNames[index]
      const queueClient = queueServiceClient.getQueueClient(queueName)
      const properties = await queueClient.getProperties()
      queueInfo.push({
        approximateMessagesCount: properties.approximateMessagesCount,
        name: queueName
      })
    }
    return Promise.all(queueInfo)
  },

  createQueues: async function createQueues (queueNames) {
    const queueCreates = queueNames.map(q => {
      const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString)
      const queueClient = queueServiceClient.getQueueClient(q)
      return queueClient.createIfNotExists()
    })
    return Promise.allSettled(queueCreates)
  },

  clearQueue: async function clearQueue (queueName) {
    const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString)
    const queueClient = queueServiceClient.getQueueClient(queueName)
    return queueClient.clearMessages()
  }
}

async function getQueueNames (queueServiceClient) {
  const queueNames = []
  const iterator = queueServiceClient.listQueues()
  let item = await iterator.next()
  while (!item.done) {
    queueNames.push(item.value.name)
    item = await iterator.next()
  }
  return queueNames
}

module.exports = service
