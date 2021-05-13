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

const azure = require('azure')
const sbService = azure.createServiceBusService(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING)
const queues = require('./queues-topics.json').queues
const queueDefaults = require('./queues-topics.json').queueDefaults

async function main () {
  const promises = queues.map(q => {
    const queueOptions = getQueueProperties(queueDefaults, q)
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
