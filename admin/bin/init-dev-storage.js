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
const { QueueClient } = require('@azure/storage-queue')
const names = require('../../deploy/storage/tables-queues.json')

if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
  process.exitCode = -1
  console.error('env var $AZURE_STORAGE_CONNECTION_STRING is required')
}

const queueNames = names.queues
const tableNames = names.tables
const poisonQueues = queueNames.map(q => q + '-poison')
const allQueues = queueNames.concat(poisonQueues)

async function deleteTableEntries (tableName) {
  const tableClient = TableClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, tableName)
  const entityIterator = tableClient.listEntities()
  const deletions = []
  for await (const entity of entityIterator) {
    deletions.push(tableClient.deleteEntity(entity.partitionKey, entity.rowKey))
  }
  return Promise.all(deletions)
}

async function deleteTableEntities (tables) {
  const deletions = []
  for (let index = 0; index < tables.length; index++) {
    const table = tables[index]
    deletions.push(deleteTableEntries(table))
  }
  await Promise.all(deletions)
}

async function createTables (tables) {
  const tableCreates = tables.map(table => {
    const tableClient = TableClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, table)
    return tableClient.createTable(table)
  })
  return Promise.all(tableCreates)
}

async function deleteQueueMessages (queues) {
  const queueDeletes = queues.map(q => {
    const queueClient = QueueClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, q)
    return queueClient.clearMessages()
  })
  return Promise.all(queueDeletes)
}

async function createQueues (queues) {
  const queueCreates = queues.map(q => {
    const queueClient = QueueClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, q)
    return queueClient.create()
  })
  return Promise.all(queueCreates)
}

async function main () {
  await createQueues(allQueues)
  await deleteQueueMessages(allQueues)
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
