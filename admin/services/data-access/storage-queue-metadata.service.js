'use strict'

const { QueueServiceClient } = require('@azure/storage-queue')
const config = require('../../config')

const service = {
  getAllQueueMessageCounts: async function getAllQueueMessageCounts () {
    const queueServiceClient = QueueServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
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
