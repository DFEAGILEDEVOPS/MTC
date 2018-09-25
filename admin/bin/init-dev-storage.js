#!/usr/bin/env node

/*
Requires your local env file to be configured with the following...
- AZURE_STORAGE_CONNECTION_STRING
*/

require('dotenv').config()
const azure = require('azure-storage')
const bluebird = require('bluebird')
const names = require('../../deploy/storage/tables-queues.json')

const queueNames = names['queues']
const tableNames = names['tables']
const tableService = getPromisifiedService(azure.createTableService())
const queueService = getPromisifiedService(azure.createQueueService())

async function deleteTables (tables) {
  const tableDeletes = tables.map(table => {
    return tableService.deleteTableIfExistsAsync(table)
  })
  return Promise.all(tableDeletes)
}

async function createTables (tables) {
  const tableCreates = tables.map(table => {
    return tableService.createTableAsync(table)
  })
  return Promise.all(tableCreates)
}

async function deleteQueueMessages (queues) {
  const queueDeletes = queues.map(q => {
    return queueService.clearMessagesAsync(q)
  })
  return Promise.all(queueDeletes)
}

async function createQueues (tables) {
  const queueCreates = queueNames.map(q => {
    return queueService.createQueueIfNotExistsAsync(q)
  })
  return Promise.all(queueCreates)
}

async function main () {
  await deleteTables(tableNames)
  await deleteQueueMessages(queueNames)
  await createTables(tableNames)
  await createQueues(queueNames)
}

main().then(() => {
  console.log('done')
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
