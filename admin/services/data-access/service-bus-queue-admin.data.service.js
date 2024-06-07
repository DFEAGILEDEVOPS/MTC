'use strict'

const sb = require('@azure/service-bus')
const config = require('../../config')

let adminClient
let queueNames

const serviceBusQueueAdminService = {
  getQueueNames: async function getQueueNames () {
    if (queueNames) return queueNames
    queueNames = []
    const queues = await getServiceBusAdminClient().listQueues()
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

  clearQueue: async function clearQueue (queueName, messageCount) {
    let sbClient, queueReceiver
    try {
      sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
      queueReceiver = sbClient.createReceiver(queueName, { receiveMode: 'receiveAndDelete' })
      await queueReceiver.receiveMessages(messageCount)
    } finally {
      await queueReceiver.close()
      await sbClient.close()
    }
  },

  getQueueActiveMessageCount: async function getQueueActiveMessageCount (queueName) {
    const counts = await getQueueMessageCount(queueName)
    return counts.activeMessageCount
  },

  sendMessageToQueue: async function sendMessageToQueue (queueName, message, contentType) {
    const sbClient = new sb.ServiceBusClient(config.ServiceBus.connectionString)
    const sender = sbClient.createSender(queueName)
    await sender.sendMessages({
      body: message,
      contentType
    })
    await sender.close()
    await sbClient.close()
  }
}

function getServiceBusAdminClient () {
  if (!adminClient) {
    adminClient = new sb.ServiceBusAdministrationClient(config.ServiceBus.connectionString)
  }
  return adminClient
}

async function getQueueMessageCount (queueName) {
  const props = await getServiceBusAdminClient().getQueueRuntimeProperties(queueName)
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
