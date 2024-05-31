'use strict'

const sb = require('@azure/service-bus')
const config = require('../../config')

let adminClient
let queueNames

const serviceBusQueueAdminService = {
  getQueueNames: async function getQueueNames () {
    if (queueNames) return queueNames
    queueNames = []
    const queues = await getQueueClient().listQueues()
    let q = await queues.next()
    while (!q.done) {
      queueNames.push(q.value.name)
      q = await queues.next()
    }
    return queueNames
  },

  getAllQueueMessageCounts: async function getAllQueueMessageCounts () {
    const queues = await serviceBusQueueAdminService.getQueueNames()
    const messageCountPromises = []
    for (let index = 0; index < queues.length; index++) {
      const qName = queues[index]
      messageCountPromises.push(getQueueMessageCount(qName))
    }
    return await Promise.all(messageCountPromises)
  },

  clearQueue: async function clearQueue (queueName) {
    let sbClient, queueReceiver
    try {
      sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
      queueReceiver = sbClient.createReceiver(queueName, { receiveMode: 'receiveAndDelete' })
      const queueMeta = await getQueueMessageCount(queueName)
      await queueReceiver.receiveMessages(queueMeta.activeMessageCount)
    } finally {
      await queueReceiver.close()
      await sbClient.close()
    }
  },

  getQueueMessageCount: async function getQueueMessageCount (queueName) {
    return getQueueMessageCount(queueName)
  }
}

function getQueueClient () {
  if (!adminClient) {
    adminClient = new sb.ServiceBusAdministrationClient(config.ServiceBus.connectionString)
  }
  return adminClient
}

async function getQueueMessageCount (queueName) {
  const props = await getQueueClient().getQueueRuntimeProperties(queueName)
  return {
    name: queueName,
    activeMessageCount: props.activeMessageCount,
    deadLetterCount: props.deadLetterMessageCount
  }
}

/*
// for local debugging
async function main () {
  const data = await getAllQueueMessageCounts()
  console.dir(data)
}

main()
  .then(() => {})
  .catch(err => console.error(err))
*/

module.exports = serviceBusQueueAdminService
