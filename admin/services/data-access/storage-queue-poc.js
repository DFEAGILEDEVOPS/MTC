'use strict'

const storage = require('azure-storage')
const bluebird = require('bluebird')
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

if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
  process.exitCode = -1
  console.error('env var $AZURE_STORAGE_CONNECTION_STRING is required')
}

const queueSvc = storage.createQueueService()

const getQueueInfo = (queueName) => {
  queueSvc.getQueueMetadata(queueName, (error, result) => {
    if (error) {
      console.error(error)
    }
    console.dir(result)
  })
}

queueSvc.listQueuesSegmented(null, (error, result, response) => {
  if (error) {
    console.error(error)
  } else {
    console.dir(result.entries)
    for (let index = 0; index < result.entries.length; index++) {
      const queue = result.entries[index]
      getQueueInfo(queue.name)
    }
  }
})

/**
 * Promisify and cache the azureTableService library as it still lacks Promise support
 */
function getPromisifiedService (storageService) {
  bluebird.promisifyAll(storageService, {
    promisifier: (originalFunction) => function (...args) {
      return new Promise((resolve, reject) => {
        try {
          originalFunction.call(this, ...args, (error, result, response) => {
            if (error) {
              return reject(error)
            }
            resolve({ result, response})
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  })
  return storageService
}
