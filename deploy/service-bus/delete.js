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

const azSb = require('@azure/service-bus')
const sbAdminClient = new azSb.ServiceBusAdministrationClient(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING)
const queues = require('./deploy.config')

async function deleteQueue (queueName) {
  const queueExists = await sbAdminClient.queueExists(queueName)
  if (queueExists) {
    console.log(`queue ${queueName} exists, attempting to delete... `)
    try {
      await sbAdminClient.deleteQueue(queueName)
    } catch (error) {
      console.error(`error deleting queue:${queueName}. ${error.message}`)
    }
  }
}

async function main () {
  const promises = queues.map(q => deleteQueue(q.name))
  await Promise.all(promises)
}

main().then(() => {
  console.log(`queues deleted successfully`)
}).catch((error) => {
  console.error(`error deleting queues: ${error.message}`)
  process.exitCode = 1
})
