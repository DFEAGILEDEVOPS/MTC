'use strict'

const { QueueServiceClient } = require('@azure/storage-queue')
const config = require('../../config')

let queueServiceClient
let queueNames

function getQueueServiceClient () {
  return QueueServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
}

const service = {
  getAllQueueMessageCounts: async function getAllQueueMessageCounts () {
    if (!queueServiceClient) {
      queueServiceClient = getQueueServiceClient()
    }
    const queueNames = await getQueueNames()
    const promises = []
    for (let index = 0; index < queueNames.length; index++) {
      const queueName = queueNames[index]
      const queueClient = queueServiceClient.getQueueClient(queueName)
      promises.push(queueClient.getProperties())
    }
    return Promise.all(promises)
  }
}

async function getQueueNames () {
  if (!queueServiceClient) {
    queueServiceClient = getQueueServiceClient()
  }
  if (queueNames) return queueNames
  queueNames = []
  const iterator = queueServiceClient.listQueues()
  let item = await iterator.next()
  while (!item.done) {
    queueNames.push(item.value.name)
    item = await iterator.next()
  }
  return queueNames
}

module.exports = service
