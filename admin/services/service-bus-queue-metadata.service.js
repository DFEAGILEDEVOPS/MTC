const sb = require('@azure/service-bus')
const config = require('../config')

let adminClient

const serviceBusQueueMetadataService = {}

const getQueueMessageCount = async (queueName) => {
  if (!adminClient) {
    adminClient = new sb.ServiceBusAdministrationClient(config.ServiceBus.connectionString)
  }
  const props = await adminClient.getQueueRuntimeProperties(queueName)
  return {
    messageCount: props.totalMessageCount,
    deadLetterCount: props.deadLetterMessageCount
  }
}

const getAllQueueMessageCounts = async () => {
  const queueInfo = []
  if (!adminClient) {
    adminClient = new sb.ServiceBusAdministrationClient(config.ServiceBus.connectionString)
  }
  const queues = await adminClient.listQueues()
  let q = await queues.next()
  while (!q.done) {
    const qName = q.value.name
    queueInfo.push({
      name: qName,
      metadata: await getQueueMessageCount(qName)
    })
    q = await queues.next()
  }
  return queueInfo
}

/*
async function main () {
  const data = await getAllQueueMessageCounts()
  console.dir(data)
}

main()
  .then(() => {})
  .catch(err => console.error(err))
*/

serviceBusQueueMetadataService.getAllQueueMessageCounts = getAllQueueMessageCounts

module.exports = serviceBusQueueMetadataService
