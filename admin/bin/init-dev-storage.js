#!/usr/bin/env node

/*
Requires your local env file to be configured with the following...
- AZURE_STORAGE_CONNECTION_STRING
*/

require('dotenv').config()
const azure = require('azure-storage')
const bluebird = require('bluebird')
const names = require('../../deploy/storage/tables-queues.json')

const queues = names['queues']
const tableNames = names['tables']
const tableService = getPromisifiedAzureTableService(azure)

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

async function main () {
  await deleteTables(tableNames)
  await createTables(tableNames)
}

main()

/**
 * Promisify and cache the azureTableService library as it still lacks Promise support
 */
function getPromisifiedAzureTableService (azureStorage) {
  const azureTableService = azureStorage.createTableService()
  bluebird.promisifyAll(azureTableService, {
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

  return azureTableService
}
