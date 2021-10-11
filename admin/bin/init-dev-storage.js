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

const { TableClient } = require('@azure/data-tables')
const tableDataService = require('../services/data-access/azure-table.data.service')
const queueDataService = require('../services/data-access/azure-queue.data.service')
const names = require('../../deploy/storage/tables-queues.json')

if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
  process.exitCode = -1
  console.error('env var $AZURE_STORAGE_CONNECTION_STRING is required')
}

const mainQueueNames = names.queues
const tableNames = names.tables
const poisonQueues = mainQueueNames.map(q => q + '-poison')
const allQueueNames = mainQueueNames.concat(poisonQueues)

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

async function clearTable (tableName) {
  const tableClient = TableClient.fromConnectionString(connectionString, tableName)
  const entityIterator = tableClient.listEntities()
  const deletions = []
  for await (const entity of entityIterator) {
    deletions.push(tableClient.deleteEntity(entity.partitionKey, entity.rowKey))
  }
  return Promise.all(deletions)
}

async function main () {
  await queueDataService.createQueues(allQueueNames)
  const clearQueueTasks = allQueueNames.map(q => queueDataService.clearQueue(q))
  await Promise.allSettled(clearQueueTasks)
  await tableDataService.createTables(tableNames)
  const clearTableTasks = tableNames.map(t => clearTable(t))
  await Promise.allSettled(clearTableTasks)
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
