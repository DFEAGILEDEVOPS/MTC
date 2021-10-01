'use strict'

const { TableClient } = require('@azure/data-tables')
const config = require('../../config')

function getClient (tableName) {
  return TableClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING, tableName)
}

const service = {
  retrieveEntity: async function retrieveEntity (tableName, partitionKey, rowKey) {
    const client = getClient(tableName)
    return client.getEntity(partitionKey, rowKey)
  }
}

module.exports = service
