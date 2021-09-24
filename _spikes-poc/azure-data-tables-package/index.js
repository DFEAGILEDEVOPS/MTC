'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables')
const uuid = require('uuid').v4

const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const entries = storageConnectionString.split(';')
const accountName = entries[1].replace('AccountName=', '')
const accountKey = entries[2].replace('AccountKey=', '')

// Enter your storage account name and shared key
const tableName = 'dataTablesSpike'

// Use AzureNamedKeyCredential with storage account and account key
// AzureNamedKeyCredential is only available in Node.js runtime, not in browsers
const credential = new AzureNamedKeyCredential(accountName, accountKey)
const client = new TableClient(`https://${accountName}.table.core.windows.net`, tableName, credential)

async function main () {
  createTable()
  createEntities()
  listEntities()
}

async function createTable () {
  await client.createTable(`${tableName}`)
}

async function listEntities () {
  let itemIterator = client.listEntities()
  let i = 1
  for await (const entity of itemIterator) {
    console.log(`Entity${i}: PartitionKey: ${entity.partitionKey} RowKey: ${entity.rowKey}`)
    i++
  }
}

async function createEntities () {
  const partition1 = uuid()
  const partition2 = uuid()
  const testEntity1 = {
    partitionKey: partition1,
    rowKey: "R1",
    foo: "foo",
    bar: 123
  }
  const testEntity2 = {
    partitionKey: partition1,
    rowKey: "R2",
    foo: "bar",
    bar: 234
  }
  const testEntity3 = {
    partitionKey: partition2,
    rowKey: "R1",
    foo: "baz",
    bar: 345
  }
  const testEntity4 = {
    partitionKey: partition2,
    rowKey: "R2",
    foo: "qux",
    bar: 456
  };
  await client.createEntity(testEntity1)
  await client.createEntity(testEntity2)
  await client.createEntity(testEntity3)
  await client.createEntity(testEntity4)
}

main()
