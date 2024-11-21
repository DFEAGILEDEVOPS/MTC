'use strict'

const { TableClient, TableServiceClient } = require('@azure/data-tables')
const config = require('../config')
const connectionString = config.AZURE_STORAGE_CONNECTION_STRING
const uuid = require('uuid')
const sut = require('../services/data-access/azure-table.data.service')
const RA = require('ramda-adjunct')

const commonPrefix = 'mtcIntegrationTest'
const testRunTableNames = []

function getUniqueTableName () {
  let id = uuid.v4()
  id = id.replace(/-/g, '')
  const name = `${commonPrefix}${id}`
  testRunTableNames.push(name)
  return name
}

async function createTable (tableName) {
  const client = TableClient.fromConnectionString(connectionString, tableName)
  return client.createTable()
}

async function deleteTable (tableName) {
  const client = TableClient.fromConnectionString(connectionString, tableName)
  return client.deleteTable()
}

describe('azure-table.data.service', () => {
  beforeAll(async () => {
    const client = TableServiceClient.fromConnectionString(connectionString)
    const iterator = client.listTables()
    const integrationTestTables = []
    for await (const table of iterator) {
      if (table.name.startsWith(commonPrefix)) {
        integrationTestTables.push(table.name)
      }
    }
    const deletions = integrationTestTables.map(t => {
      return client.deleteTable(t)
    })
    await Promise.all(deletions)
  })
  afterAll(async () => {
    try {
      const deletions = testRunTableNames.map(t => {
        return deleteTable(t)
      })
      await Promise.all(deletions)
    } catch (error) {
      fail(`failed to delete one or more tables, azure storage may need manual clean up.\n${error}`)
    }
  })

  describe('retrieveEntity', () => {
    test('returns raw entity when exists', async () => {
      const tableName = getUniqueTableName()
      await createTable(tableName)
      const partitionKey = uuid.v4()
      const rowKey = 'myRowKey'
      const customData = 'foo'
      const client = TableClient.fromConnectionString(connectionString, tableName)
      await client.createEntity({
        partitionKey,
        rowKey,
        customData
      })
      const actual = await sut.retrieveEntity(tableName, partitionKey, rowKey)
      expect(actual).toBeDefined()
      expect(actual.partitionKey).toEqual(partitionKey)
      expect(actual.rowKey).toEqual(rowKey)
      expect(actual.customData).toEqual(customData)
    })

    test('throws an error when entity does not exist', async () => {
      const tableName = getUniqueTableName()
      await createTable(tableName)
      const pk = uuid.v4()
      const rk = uuid.v4()
      await expect(sut.retrieveEntity(tableName, pk, rk)).rejects.toThrow(`entity not found with PartitionKey:${pk} rowKey:${rk}`)
    })
  })

  describe('createTables', () => {
    test('creates specified tables in array', async () => {
      const tableNames = [
        getUniqueTableName(),
        getUniqueTableName(),
        getUniqueTableName()
      ]
      await sut.createTables(tableNames)
      const client = TableServiceClient.fromConnectionString(connectionString)
      const tableIterator = client.listTables()
      const actualTables = []
      for await (const table of tableIterator) {
        actualTables.push(table.name)
      }
      const failures = []
      for (const table of tableNames) {
        if (!RA.included(actualTables, table)) {
          failures.push(table)
        }
      }
      if (failures.length > 0) {
        let message = 'the following tables were not found...'
        for (const failure of failures) {
          message += `\n-${failure}`
        }
        fail(message)
      }
    })

    test('throws an error when one of the table names is invalid', async () => {
      const randomPrefix = getUniqueTableName()
      const tableNames = [
        getUniqueTableName(),
        `${randomPrefix}-Bad&chars^1`
      ]
      await expect(sut.createTables(tableNames)).rejects.toThrow()
    })
  })
})
