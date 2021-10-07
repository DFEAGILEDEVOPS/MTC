'use strict'

const { TableClient } = require('@azure/data-tables')
const config = require('../../config')

const connectionString = config.AZURE_STORAGE_CONNECTION_STRING

const service = {
  retrieveEntity: async function retrieveEntity (tableName, partitionKey, rowKey) {
    const client = TableClient.fromConnectionString(connectionString, tableName)
    return client.getEntity(partitionKey, rowKey)
  },

  clearTable: async function clearTable (tableName) {
    const tableClient = TableClient.fromConnectionString(connectionString, tableName)
    const entityIterator = tableClient.listEntities()
    const deletions = []
    for await (const entity of entityIterator) {
      deletions.push(tableClient.deleteEntity(entity.partitionKey, entity.rowKey))
    }
    return Promise.allSettled(deletions)
  },

  createTables: async function createTables (tables) {
    const tableCreates = tables.map(table => {
      const tableClient = TableClient.fromConnectionString(connectionString, table)
      return tableClient.createTable(table)
    })
    return Promise.allSettled(tableCreates)
  }
}

module.exports = service
