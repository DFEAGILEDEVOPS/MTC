'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const { QueueServiceClient, ServiceListQueuesOptions } = require("@azure/storage-queue")

const queueServiceClient = QueueServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)

async function main() {
  // await listQueuesForAwaitOf()
  await listQueuesIterator()
  const data = await listQueueCounts()
  console.dir(data)
  await createQueue()
  await addMessageToQueue()
}

async function getQueueNamesArray () {
  let iter1 = queueServiceClient.listQueues()
  const names = []
  for await (const item of iter1) {
    names.push(item.name)
  }
  return names
}

async function listQueueCounts () {
  const names = await getQueueNamesArray()
  const results = []
  for (let index = 0; index < names.length; index++) {
    const name = names[index]
    const queueClient = queueServiceClient.getQueueClient(name)
    const props = await queueClient.getProperties()
    results.push({
      name: name,
      count: props.approximateMessagesCount
    })
  }
  return results
}

async function listQueuesIterator () {
  const serviceListQueuesOptions = {
    includeMetadata: true
  }
  let iter2 = queueServiceClient.listQueues(serviceListQueuesOptions)
  let i = 1
  let item = await iter2.next()
  while (!item.done) {
    console.dir(item)
    console.log(`Queue ${i++}: ${item.value.name}`)
    item = await iter2.next()
  }
}

const queueName = 'spike-create-queue'

async function createQueue () {
  const queueClient = queueServiceClient.getQueueClient(queueName)
  const createQueueResponse = await queueClient.create()
  console.log(`created queue: ${queueName}`)
}

async function addMessageToQueue () {
  const queueClient = queueServiceClient.getQueueClient(queueName)
  // Send a message into the queue using the sendMessage method.
  const sendMessageResponse = await queueClient.sendMessage("Hello World!")
  console.log(
    `Sent message successfully, service assigned message Id: ${sendMessageResponse.messageId}, service assigned request Id: ${sendMessageResponse.requestId}`
  )
}

main()
