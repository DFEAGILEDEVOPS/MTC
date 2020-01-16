'use strict'

require('dotenv').config()
const azure = require('azure')
const sbService = azure.createServiceBusService(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING)
const queues = require('./queues-topics.json').queues
const fiveGigabytes = 5120
const fourteenDays = 'P14D'
const fiveMinutes = 'PT5M'
const oneDay = 'P1D'

const defaultQueueOptions = {
  MaxSizeInMegabytes: fiveGigabytes,
  DefaultMessageTimeToLive: fourteenDays,
  LockDuration: fiveMinutes,
  RequiresDuplicateDetection: true,
  DeadLetteringOnMessageExpiration: true,
  DuplicateDetectionHistoryTimeWindow: oneDay,
  EnablePartitioning: false,
  RequiresSession: false
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
  const promises = queues.map(q => createQueue(q, defaultQueueOptions))
  await Promise.all(promises)
}

main().then(() => {
  console.log(`queues created successfully`)
}).catch((error) => {
  console.error(`error creating queues: ${error.message}`)
  process.exitCode = 1
})
