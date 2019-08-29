'use strict'

require('dotenv').config()
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./config')
const endpoint = config.endpoint
const key = config.key
const partitionKey = { kind: 'Hash', paths: ['/schoolUUID'] }
const client = new CosmosClient({ endpoint, key })
const uuid = require('uuid/v4')
const largeCheck = require('./example-large-complete-check.json')

/**
 * Create the database if it does not exist
 */
async function createDatabase () {
  const { database } = await client.databases.createIfNotExists({
    id: config.database.id
  })
  console.log(`connected to ${database.id} db`)
}

/**
 * Create the container if it does not exist
 */
async function createContainer () {
  const { container } = await client
    .database(config.database.id)
    .containers.createIfNotExists(
      { id: config.container.id, partitionKey },
      { offerThroughput: 400 }
    )
  console.log(`container ${container.id} exists`)
}

async function persistCheck (check) {
  const response = await client
    .database(config.database.id)
    .container(config.container.id)
    .items.create(check)
  console.dir(response)
  return response
}

async function queryCheck (checkCode) {
  console.log(`Querying container:\n${config.container.id}`)

  const querySpec = {
    query: 'SELECT VALUE r.children FROM root r WHERE r.checkCode = @checkCode',
    parameters: [
      {
        name: '@checkCode',
        value: checkCode
      }
    ]
  }
  const { resources: results } = await client
    .database(config.database.id)
    .container(config.container.id)
    .items.query(querySpec)
    .fetchAll()
  for (var queryResult of results) {
    let resultString = JSON.stringify(queryResult)
    console.log(`\tQuery returned ${resultString}\n`)
  }
}

/**
 * Exit the app with a prompt
 * @param {string} message - The message to display
 */
function exit (message) {
  console.log(message)
  console.log('Press any key to exit')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}

const getLargeCheck = () => {
  const copy = JSON.parse(JSON.stringify(largeCheck))
  copy.schoolUUID = uuid()
  copy.checkCode = uuid()
  copy.createdAt = new Date()
  return copy
}

createDatabase()
  .then(() => createContainer())
  .then(() => persistCheck(getLargeCheck()))
  // .then(() => queryCheck(newCheck.checkCode))
  .then(() => exit('done'))
  .catch(error => {
    exit(`error ${JSON.stringify(error)}`)
  })
