'use strict'

const storage = require('azure-storage')
const bluebird = require('bluebird')

let queueService

const listQueuesAsync = () => {
  return new Promise((resolve, reject) => {

  })
}

const service = {
  getAllQueueMessageCounts: async function getAllQueueMessageCounts () {
    if (!queueService) {
      queueService = getPromisifiedService(storage.createQueueService())
    }
    const response = await queueService.listQueuesSegmentedAsync(null)
    const queues = response.result.entries
    const promises = []
    for (let index = 0; index < queues.length; index++) {
      const queue = queues[index]
      promises.push(queueService.getQueueMetadataAsync(queue.name))
    }
    return Promise.all(promises)
  }
}

module.exports = service

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
