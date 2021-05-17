'use strict'
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')
const R = require('ramda')

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

const sbDeployConfig = require('../deploy.config').ServiceBus
const azSb = require('@azure/service-bus')
const sbAdminClient = new azSb.ServiceBusAdministrationClient(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING)
const queues = sbDeployConfig.Queues
const queueDefaults = sbDeployConfig.QueueDefaults

async function main () {
  const promises = queues.map(q => {
    const queueOptions = getQueueProperties(queueDefaults, q.name)
    return createQueue(q.name, queueOptions)
  })
  await Promise.all(promises)
}

function debug () {
  const data = queues.map(q => {
    console.dir(getQueueProperties(queueDefaults, q))
  })
}

function getQueueProperties (queueDefaults, queueInfo) {
  const props = R.mergeRight(queueDefaults, queueInfo)
  return R.omit([ "name" ], props)
}

async function createOrUpdateQueue (queueName, queueOptions) {
  return new Promise((resolve, reject) => {
    const queueExists = await sbAdminClient.queueExists(queueName)
    if (queueExists) {
      // update
    } else {
      await sbAdminClient.createQueue(queueName, queueOptions)
    }

    sbService.createQueueIfNotExists(queueName, queueOptions, function (error) {
      if (!error) {
        console.log(`${queueName} queue created`)
        resolve()
      } else {
        reject(error)
      }
    })
  })
}

const createQueue = (queueName, queueOptions) => (new Promise((resolve, reject) => {
  sbService.createQueueIfNotExists(queueName, queueOptions, function (error) {
    if (!error) {
      console.log(`${queueName} queue created`)
      resolve()
    } else {
      reject(error)
    }
  })
}))

// debug()

main().then(() => {
  console.log(`queues created successfully`)
}).catch((error) => {
  console.error(`error creating queues: ${error.message}`)
  process.exitCode = 1
})
