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
const { mainModule } = require('process')

async function testQueueOperations() {
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 5)

  const queueServiceClient = QueueServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
  const queueClient = queueServiceClient.getQueueClient('guy-test-queue')
  await queueClient.createIfNotExists()
  await queueClient.sendMessage('message from raw client', { expiresOn: expiryDate })

  // generate sas token
  const permissions = new QueueSASPermissions()
  permissions.add = true
  const tokenStartDate = new Date()
  tokenStartDate.setHours(tokenStartDate.getHours() - 5)
  const opts = {
    startsOn: tokenStartDate,
    expiresOn: expiryDate,
    permissions: permissions
  }

  const token = queueClient.generateSasUrl(opts)
  console.log('token obtained...')
  console.dir(token)

  // test token usability
  const connectionUrl = token.replace('/check-submitted', '')
  const sasQueueServiceClient = new QueueServiceClient(connectionUrl)
  const sasQueueClient = sasQueueServiceClient.getQueueClient('check-submitted')
  try {
    const response = await sasQueueClient.sendMessage('testing sas token send message', { expiresOn: expiryDate })
    console.dir(response)
  } catch (error) {
    console.error(error)
  }
}

async function main () {
 await testQueueOperations()
}

main()

