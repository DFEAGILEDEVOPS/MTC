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

const { QueueServiceClient } = require("@azure/storage-queue")

const queueServiceClient = QueueServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)

async function main() {
  await listQueuesForAwaitOf()
  await listQueuesIterator()
  await createQueue()
  await addMessageToQueue()
}

async function listQueuesForAwaitOf () {
  let iter1 = queueServiceClient.listQueues()
  let i = 1
  for await (const item of iter1) {
    console.log(`Queue${i}: ${item.name}`)
    i++
  }
}

async function listQueuesIterator () {
  let iter2 = queueServiceClient.listQueues()
  let i = 1
  let item = await iter2.next()
  while (!item.done) {
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
