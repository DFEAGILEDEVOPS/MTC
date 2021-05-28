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
const sbQueueConfig = require('./deploy.config')

async function main () {
  const promises = sbQueueConfig.map(q => {
    return createOrUpdateQueue(q)
  })
  await Promise.all(promises)
}

async function createOrUpdateQueue (queueInfo) {
  const queueExists = await sbAdminClient.queueExists(queueInfo.name)
  if (queueExists) {
    console.log(`queue ${queueInfo.name} exists, comparing properties... `)
    const queue = await sbAdminClient.getQueue(queueInfo.name)
    const queueUpdate = R.mergeRight(queue, queueInfo)
    if (R.equals(queue, queueUpdate)) {
      console.log(`no properties to update for ${queueInfo.name}.`)
      return
    } else {
      console.log(`updated properties for ${queueInfo.name} found. performing update...`)
      console.dir(queueUpdate)
      return sbAdminClient.updateQueue(queueUpdate)
    }
  } else {
    console.log(`${queueInfo.name} does not exist. creating...`)
    return sbAdminClient.createQueue(queueInfo.name, queueInfo)
  }
}

main().then(() => {
  console.log(`service bus entity update successful`)
}).catch((error) => {
  console.error(`error performing service bus entity update: ${error.message}`)
  console.error(error)
  process.exitCode = 1
})
