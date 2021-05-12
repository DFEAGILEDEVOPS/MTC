'use strict'

const storage = require('azure-storage')
const bluebird = require('bluebird')

let queueService
let queueNames

const service = {
  getAllQueueMessageCounts: async function getAllQueueMessageCounts () {
    if (!queueService) {
      queueService = getPromisifiedService(storage.createQueueService())
    }
    const queues = await getQueueNames()
    const promises = []
    for (let index = 0; index < queues.length; index++) {
      const queue = queues[index]
      promises.push(queueService.getQueueMetadataAsync(queue))
    }
    return Promise.all(promises)
  }
}

async function getQueueNames () {
  if (!queueService) {
    queueService = getPromisifiedService(storage.createQueueService())
  }
  if (queueNames) return queueNames
  const response = await queueService.listQueuesSegmentedAsync(null)
  queueNames = []
  const queues = response.result.entries
  for (let index = 0; index < queues.length; index++) {
    const queue = queues[index]
    queueNames.push(queue.name)
  }
  return queueNames
}

function getPromisifiedService (storageService) {
  bluebird.promisifyAll(storageService, {
    promisifier: (originalFunction) => function (...args) {
      return new Promise((resolve, reject) => {
        try {
          originalFunction.call(this, ...args, (error, result, response) => {
            if (error) {
              return reject(error)
            }
            resolve({ result, response })
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  })
  return storageService
}

module.exports = service
