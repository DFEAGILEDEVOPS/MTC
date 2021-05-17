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

const R = require('ramda')
const azSb = require('@azure/service-bus')
const sbAdminClient = new azSb.ServiceBusAdministrationClient(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING)
const sbDeployConfig = require('../deploy.config').ServiceBus
const queues = sbDeployConfig.Queues
const queueDefaults = sbDeployConfig.QueueDefaults

async function main () {
  const promises = queues.map(q => {
    return createOrUpdateQueue(q.name)
  })
  await Promise.all(promises)
}

function getQueueOptions (queueName) {
  const queueSpecificOptions = R.find(R.propEq('name', queueName))(queues)
  const props = R.mergeRight(queueDefaults, queueSpecificOptions)
  return props
}

async function createOrUpdateQueue (queueName) {
  const queueOptions = getQueueOptions(queueName)
  const queueExists = await sbAdminClient.queueExists(queueName)
  if (queueExists) {
    const queue = await sbAdminClient.getQueue(queueName)
    // merge in the extra config and compare
    const queueUpdate = R.mergeRight(queue, queueOptions)
    if (R.equals(queue, queueUpdate)) {
      console.log(`no updated settings for existing queue ${queueName}.`)
      return
    } else {
      console.log(`updated settings for ${queueName} queue. Updating to...`)
      console.dir(queueUpdate)
      return sbAdminClient.updateQueue(queueUpdate)
    }
  } else {
    console.log(`${queueName} does not exist. creating...`)
    return sbAdminClient.createQueue(queueName, queueOptions)
  }
}

main().then(() => {
  console.log(`service bus entity update successful`)
}).catch((error) => {
  console.error(`error performing service bus entity update: ${error.message}`)
  console.error(error)
  process.exitCode = 1
})
