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
const queues = require('../deploy.config').ServiceBus.Queues
const defaultQueueOptions = require('../deploy.config').ServiceBus.QueueDefaults
const fiveGigabytes = 5120
const fourteenDays = 'P14D'
const fiveMinutes = 'PT5M'
const oneDay = 'P1D'

function makeObjectPropertiesFirstCharUpperCase (obj) {
  var key, keys = Object.keys(obj)
  var n = keys.length
  var newobj={}
  while (n--) {
    key = `${keys[n].substr(0,1).toUpperCase()}${keys[n].substr(1)}`
    newobj[key] = obj[key]
  }
  return newobj
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

async function main () {
  const promises = queues.map(q => {
    const queueOptions = R.clone(makeObjectPropertiesFirstCharUpperCase(defaultQueueOptions))
    return createQueue(q.name, queueOptions)
  })
  await Promise.all(promises)
}

main().then(() => {
  console.log(`queues created successfully`)
}).catch((error) => {
  console.error(`error creating queues: ${error.message}`)
  process.exitCode = 1
})
