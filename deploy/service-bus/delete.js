'use strict'

require('dotenv').config()
const azure = require('azure')
const sbService = azure.createServiceBusService()
const queues = require('./queues-topics.json').queues

const deleteQueue = (queueName) => (new Promise((resolve, reject) => {
  sbService.deleteQueue(queueName, function (error) {
    if (!error) {
      console.log(`${queueName} queue deleted`)
      resolve()
    } else {
      reject(error)
    }
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
