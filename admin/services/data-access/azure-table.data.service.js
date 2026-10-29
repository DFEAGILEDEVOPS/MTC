'use strict'

const nodeCrypto = require('crypto')
if (globalThis.crypto === undefined && nodeCrypto.webcrypto !== undefined) {
  globalThis.crypto = nodeCrypto.webcrypto
}
if (typeof globalThis.crypto?.randomUUID !== 'function' && typeof nodeCrypto.randomUUID === 'function') {
  if (globalThis.crypto === undefined) {
    globalThis.crypto = {}
  }
  globalThis.crypto.randomUUID = () => nodeCrypto.randomUUID()
}

const { TableServiceClient, TableClient } = require('@azure/data-tables')
const config = require('../../config')

const connectionString = config.AZURE_STORAGE_CONNECTION_STRING

const service = {
  retrieveEntity: async function retrieveEntity (tableName, partitionKey, rowKey) {
    const client = TableClient.fromConnectionString(connectionString, tableName)
    try {
      const entity = await client.getEntity(partitionKey, rowKey)
      return entity
    } catch (error) {
      if (error.details.odataError.code === 'ResourceNotFound') {
        throw new Error(`entity not found with PartitionKey:${partitionKey} rowKey:${rowKey}`)
      } else {
        throw error
      }
    }
  },

  createTables: async function createTables (tables) {
    const tableService = TableServiceClient.fromConnectionString(connectionString)
    const tableCreates = tables.map(table => {
      return tableService.createTable(table)
    })
    return Promise.all(tableCreates)
  }
}

module.exports = service
