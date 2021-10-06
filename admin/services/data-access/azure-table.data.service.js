'use strict'

const { TableClient } = require('@azure/data-tables')
const config = require('../../config')

// TODO cache the client once loaded, or is it better to recreate each time?

const service = {
  retrieveEntity: async function retrieveEntity (tableName, partitionKey, rowKey) {
    const client = TableClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING, tableName)
    return client.getEntity(partitionKey, rowKey)
  }
}

module.exports = service
