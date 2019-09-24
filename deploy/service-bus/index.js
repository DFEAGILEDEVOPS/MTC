'use strict'

require('dotenv').config()
const azure = require('azure')
const sbService = azure.createServiceBusService()
const queues = require('./queues-topics.json')

const defaultQueueOptions = {
  MaxSizeInMegabytes: '5120',
  DefaultMessageTimeToLive: ''
}

const createQueue = (queueName, queueOptions) => (new Promise((resolve, reject) => {
  sbService.createQueueIfNotExists(queueName, queueOptions, function (error) {
    if (!error) {
      console.log(`${q} queue created`)
      resolve()
    } else {
      reject(error)
    }
  })
})

async function main () {
  try {
    const promises = queues.map(q => createQueue(q, defaultQueueOptions))
    await Promise.all(promises)
  } catch (error) {
    process.exitCode = 1
    console.error(`Error creating queue: ${error.message}`)
  }
}

main().then(() => {
  console.log(`queues created successfully`)
})
