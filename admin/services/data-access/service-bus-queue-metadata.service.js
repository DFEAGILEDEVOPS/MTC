'use strict'

const sb = require('@azure/service-bus')
const config = require('../../config')

// TODO move this to data access folder once storage queue service is done, and aggregate both from there

let adminClient
let queueNames

const serviceBusQueueMetadataService = {
  getQueueNames: async function getQueueNames () {
    if (queueNames) return
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
    const queues = await serviceBusQueueMetadataService.getQueueNames()
    const messageCountPromises = []
    for (let index = 0; index < queues.length; index++) {
      const qName = queues[index]
      messageCountPromises.push(getQueueMessageCount(qName))
    }
    return await Promise.all(messageCountPromises)
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
    activeMessageCount: props.totalMessageCount,
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

module.exports = serviceBusQueueMetadataService
