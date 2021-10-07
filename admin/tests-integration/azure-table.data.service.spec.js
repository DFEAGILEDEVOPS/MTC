'use strict'

/* global describe expect beforeAll afterAll spyOn fail it */

const { TableClient, TableServiceClient } = require('@azure/data-tables')
const config = require('../config')
const connectionString = config.AZURE_STORAGE_CONNECTION_STRING
const uuid = require('uuid')
const sut = require('../services/data-access/azure-table.data.service')

const commonPrefix = 'mtcIntegrationTest'
let testRunTableName

function getUniqueName () {
  let id = uuid.v4()
  id = id.replace(/-/g, '')
  return `${commonPrefix}${id}`
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
    testRunTableName = getUniqueName()
    try {
      await createTable(testRunTableName)
    } catch (error) {
      fail(`COULD NOT DELETE TABLE '${testRunTableName}':${error.message}`)
    }
  })

  afterAll(async () => {
    try {
      await deleteTable(testRunTableName)
    } catch (error) {
      fail(`COULD NOT DELETE TABLE '${testRunTableName}':${error.message}`)
    }
  })

  describe('retrieveEntity', () => {
    it('returns raw entity when exists', async () => {
      const partitionKey = uuid.v4()
      const rowKey = 'myRowKey'
      const customData = 'foo'
      const client = TableClient.fromConnectionString(connectionString, testRunTableName)
      await client.createEntity({
        partitionKey: partitionKey,
        rowKey: rowKey,
        customData: customData
      })
      const actual = await sut.retrieveEntity(testRunTableName, partitionKey, rowKey)
      expect(actual).toBeDefined()
      expect(actual.partitionKey).toEqual(partitionKey)
      expect(actual.rowKey).toEqual(rowKey)
      expect(actual.customData).toEqual(customData)
    })

    it('throws an error when entity does not exist', async () => {
      const pk = uuid.v4()
      const rk = uuid.v4()
      try {
        await sut.retrieveEntity(testRunTableName, pk, rk)
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toEqual(`entity not found with PartitionKey:${pk} rowKey:${rk}`)
      }
    })
  })

  describe('clearTable', () => {
    it('deletes all entries from the table', async () => {
      const pk = uuid.v4()
      const tableName = getUniqueName()
      const client = TableClient.fromConnectionString(connectionString, tableName)
      await client.createTable()
      for (let index = 0; index < 5; index++) {
        await client.createEntity({
          partitionKey: pk,
          rowKey: index.toString()
        })
      }
      await sut.clearTable(tableName)
      const entityIterator = client.listEntities()
      let entityCount = 0
      for await (const entity of entityIterator) {
        entityCount++
        fail(`found entity in table. pk:${entity.partitionKey} rk:${entity.rowKey}`)
      }
      expect(entityCount).toBe(0)
    })
  })

  describe('createTables', () => {
    it('creates specified tables in array', async () => {
      const randomPrefix = getUniqueName()
      const tableNames = [
        `${randomPrefix}Table1`,
        `${randomPrefix}Table2`,
        `${randomPrefix}Table3`
      ]
      await sut.createTables(tableNames)
      const client = TableServiceClient.fromConnectionString(connectionString)
      const tableIterator = client.listTables()
      for await (const table in tableIterator) {

      }
    })

    it('throws an error when one of the table names is invalid', async () => {
      fail('not implemented')
    })
  })
})
