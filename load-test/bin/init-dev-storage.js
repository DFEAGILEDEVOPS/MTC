#!/usr/bin/env node

/*
Requires your local env file to be configured with the following...
- AZURE_STORAGE_CONNECTION_STRING
*/

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

const azure = require('azure-storage')
const bluebird = require('bluebird')
const names = require('../../deploy/storage/tables-queues.json')

if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
  process.exitCode = -1
  console.error('env var $AZURE_STORAGE_CONNECTION_STRING is required')
}

const queueNames = names['queues']
const tableNames = names['tables']
const poisonQueues = queueNames.map(q => q + '-poison')
const allQueues = queueNames.concat(poisonQueues)
const tableService = getPromisifiedService(azure.createTableService())
const queueService = getPromisifiedService(azure.createQueueService())

async function deleteTableEntities (tables) {
  const deletions = []
  for (let index = 0; index < tables.length; index++) {
    const table = tables[index]
    const query = new azure.TableQuery() // Azure Table Storage has a max of 1000 records returned
    let done = false
    let batch = 1
    while (!done) {
      const data = await tableService.queryEntitiesAsync(table, query, null)
      const entities = data.result.entries
      if (entities.length === 0) {
        done = true
      }
      console.log(`Found ${entities.length} entities to delete in batch ${batch++} from ${table}`)
      entities.forEach(entity => {
        deletions.push(tableService.deleteEntityAsync(table, entity))
      })
      await Promise.all(deletions)
    }
  }
}

async function createTables (tables) {
  const tableCreates = tables.map(table => {
    return tableService.createTableIfNotExistsAsync(table)
  })
  return Promise.all(tableCreates)
}

async function deleteQueueMessages (queues) {
  const queueDeletes = queues.map(q => {
    console.log(`clearing queue ${q}`)
    return queueService.clearMessagesAsync(q)
  })
  return Promise.all(queueDeletes)
}

async function createQueues (queues) {
  const queueCreates = queues.map(q => {
    return queueService.createQueueIfNotExistsAsync(q)
  })
  return Promise.all(queueCreates)
}

async function main () {
  await createQueues(allQueues)
  await deleteQueueMessages(allQueues)
  console.log('all queues cleared')
  await createTables(tableNames)
  await deleteTableEntities(tableNames)
}

main()
  .then(() => {
    console.log('done')
  },
  (error) => {
    console.error(error.message)
  })
  .catch(error => {
    console.error('Caught error: ' + error.message)
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
