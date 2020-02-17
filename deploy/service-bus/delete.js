'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const azure = require('azure')
const sbService = azure.createServiceBusService(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING)
const queues = require('./queues-topics.json').queues

const deleteQueue = (queueName) => (new Promise((resolve, reject) => {
  // There is no counterpart to createQueueIfNotExists, although deleteQueueIfNotExists is available
  // for StorageQueues
  sbService.getQueue(queueName, (error, res) => {
    if (error) {
      console.log(`${queueName} queue not found`)
      return
    }
    sbService.deleteQueue(queueName, function (error) {
      if (!error) {
        console.log(`${queueName} queue deleted`)
        resolve()
      } else {
        reject(error)
      }
    })
  })
}))

async function main () {
  const promises = queues.map(q => deleteQueue(q))
  await Promise.all(promises)
}

main().then(() => {
  console.log(`queues deleted successfully`)
}).catch((error) => {
  console.error(`error deleting queues: ${error.message}`)
  process.exitCode = 1
})
