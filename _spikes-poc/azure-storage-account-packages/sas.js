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

const { QueueServiceClient, QueueSASPermissions } = require("@azure/storage-queue")
const uuid = require('uuid')

async function testQueueOperations() {
  // const queueName = `spike-test-queue-${uuid.v4()}`
  const queueName = 'check-submitted'
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 5)

  // test raw message
  const queueServiceClient = QueueServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
  const queueClient = queueServiceClient.getQueueClient(queueName)
  await queueClient.createIfNotExists()
  await queueClient.sendMessage('message from raw client')

  // generate sas token
  const permissions = new QueueSASPermissions()
  permissions.add = true
  const tokenStartDate = new Date()
  tokenStartDate.setMinutes(tokenStartDate.getMinutes() - 5)
  const opts = {
    startsOn: tokenStartDate,
    expiresOn: expiryDate,
    permissions: permissions
  }

  const token = queueClient.generateSasUrl(opts)
  console.log('token obtained...')
  console.dir(token)

  // test token usability
  const connectionUrl = token.replace(`/${queueName}`, '')
  const sasQueueServiceClient = new QueueServiceClient(connectionUrl)
  const sasQueueClient = sasQueueServiceClient.getQueueClient(queueName)
  try {
    const response = await sasQueueClient.sendMessage('testing sas token send message')
    console.dir(response)
  } catch (error) {
    console.error(error)
  }
}

async function main () {
 await testQueueOperations()
}

main()

