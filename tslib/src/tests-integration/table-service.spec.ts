import { TableService } from '../azure/table-service'
import { TableClient, TableServiceClient } from '@azure/data-tables'
import { v4 as uuid } from 'uuid'
import config from '../config'

const commonPrefix = 'mtcIntegrationTest'
const testRunTableNames: string[] = []
const connectionString = config.AzureStorage.ConnectionString

function getUniqueTableName (): string {
  let id = uuid()
  id = id.replace(/-/g, '')
  const name = `${commonPrefix}${id}`
  testRunTableNames.push(name)
  return name
}

async function createTable (): Promise<string> {
  const tableName = getUniqueTableName()
  const client = TableClient.fromConnectionString(connectionString, tableName)
  await client.createTable()
  return tableName
}

async function deleteTable (tableName: string): Promise<any> {
  const client = TableClient.fromConnectionString(connectionString, tableName)
  return client.deleteTable()
}

let sut: TableService

describe('TableService', () => {
  beforeEach(() => {
    sut = new TableService()
  })

  beforeAll(async () => {
    const client = TableServiceClient.fromConnectionString(connectionString)
    const iterator = client.listTables()
    const integrationTestTables = []
    for await (const table of iterator) {
      if (table.name === undefined) return
      if (table.name.startsWith(commonPrefix)) {
        integrationTestTables.push(table.name)
      }
    }
    const deletions = integrationTestTables.map(async t => {
      return client.deleteTable(t)
    })
    await Promise.all(deletions)
  })

  afterAll(async () => {
    try {
      const deletions = testRunTableNames.map(async t => {
        return deleteTable(t)
      })
      await Promise.all(deletions)
    } catch (error) {
      fail(`failed to delete one or more tables, azure storage may need manual clean up.\n${error}`)
    }
  })

  describe('createEntity()', () => {
    test('persists a new entity to table storage', async () => {
      const tableName = await createTable()
      const dataValue = uuid()
      const entity = {
        partitionKey: uuid(),
        rowKey: uuid(),
        data: dataValue,
        receivedAt: new Date()
      }
      await sut.createEntity(tableName, entity)
      const client = TableClient.fromConnectionString(connectionString, tableName)
      const storedEntity = await client.getEntity(entity.partitionKey, entity.rowKey)
      expect(storedEntity).toBeDefined()
      expect(storedEntity.data).toStrictEqual(dataValue)
    })

    test('throws an error when entity already exists', async () => {
      const tableName = await createTable()
      const dataValue = uuid()
      const entity = {
        partitionKey: uuid(),
        rowKey: uuid(),
        data: dataValue,
        receivedAt: new Date()
      }
      await sut.createEntity(tableName, entity)
      await expect(sut.createEntity(tableName, entity)).rejects.toHaveProperty('details.odataError.code', 'EntityAlreadyExists')
    })
  })

  describe('getEntity()', () => {
    test('returns entity when exists', async () => {
      const tableName = await createTable()
      const pk = uuid()
      const rk = uuid()
      const data = uuid()
      const entity = {
        partitionKey: pk,
        rowKey: rk,
        data
      }
      const client = TableClient.fromConnectionString(connectionString, tableName)
      await client.createEntity(entity)
      await expect(sut.getEntity(tableName, pk, rk)).resolves.toHaveProperty('data', data)
    })

    test('returns raw error when entity does not exist', async () => {
      const tableName = await createTable()
      const pk = uuid()
      const rk = uuid()
      await expect(sut.getEntity(tableName, pk, rk))
        .rejects.toHaveProperty('details.odataError.code', 'ResourceNotFound')
    })
  })

  describe('replaceEntity()', () => {
    test('completely replaces existing entity', async () => {
      const tableName = await createTable()
      const pk = uuid()
      const rk = uuid()
      const entity = {
        partitionKey: pk,
        rowKey: rk,
        data: uuid()
      }
      const client = TableClient.fromConnectionString(connectionString, tableName)
      await client.createEntity(entity)
      const newDataValue = uuid()
      const replacementEntity = {
        partitionKey: pk,
        rowKey: rk,
        newData: newDataValue
      }
      await sut.replaceEntity(tableName, replacementEntity)
      const replacedEntity = await client.getEntity(pk, rk)
      expect(replacedEntity.partitionKey).toStrictEqual(pk)
      expect(replacedEntity.rowKey).toStrictEqual(rk)
      expect(replacedEntity.newData).toStrictEqual(newDataValue)
      expect(replacedEntity.data).toBeUndefined()
    })

    test('throws an error when entity does not already exist', async () => {
      const tableName = await createTable()
      const pk = uuid()
      const rk = uuid()
      const replacementEntity = {
        partitionKey: pk,
        rowKey: rk,
        newData: uuid()
      }
      await expect(sut.replaceEntity(tableName, replacementEntity))
        .rejects.toHaveProperty('details.odataError.code', 'ResourceNotFound')
    })
  })

  describe('mergeUpdateEntity()', () => {
    test('adds new properties to existing entity', async () => {
      const tableName = await createTable()
      const pk = uuid()
      const rk = uuid()
      const originalData = uuid()
      const entity = {
        partitionKey: pk,
        rowKey: rk,
        data: originalData
      }
      const client = TableClient.fromConnectionString(connectionString, tableName)
      await client.createEntity(entity)
      const newDataValue = uuid()
      const updatedEntityData = {
        partitionKey: pk,
        rowKey: rk,
        newData: newDataValue
      }
      await sut.mergeUpdateEntity(tableName, updatedEntityData)
      const updatedEntity = await client.getEntity(pk, rk)
      expect(updatedEntity.partitionKey).toStrictEqual(pk)
      expect(updatedEntity.rowKey).toStrictEqual(rk)
      expect(updatedEntity.data).toStrictEqual(originalData)
      expect(updatedEntity.newData).toStrictEqual(newDataValue)
    })

    test('throws an error when entity does not already exist', async () => {
      const tableName = await createTable()
      const pk = uuid()
      const rk = uuid()
      const replacementEntity = {
        partitionKey: pk,
        rowKey: rk,
        newData: uuid()
      }
      await expect(sut.mergeUpdateEntity(tableName, replacementEntity))
        .rejects.toHaveProperty('details.odataError.code', 'ResourceNotFound')
    })
  })
})
