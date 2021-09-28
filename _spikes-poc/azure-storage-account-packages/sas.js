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

const { QueueServiceClient, QueueSASPermissions, AccountSASPermissions, QueueClient } = require("@azure/storage-queue")

const queueServiceClient = QueueServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, )
const queueClient = queueServiceClient.getQueueClient('check-submitted')
const permissions = new QueueSASPermissions()
permissions.add = true
const expiryDate = new Date()
expiryDate.setHours(expiryDate.getHours() + 1)
const opts = {
  expiresOn: expiryDate,
  permissions: permissions,

}

const t = queueClient.generateSasUrl(opts)
console.log(t)
