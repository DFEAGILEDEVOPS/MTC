#!/usr/bin/env node

/*
Requires your local env file to be configured with the following...
- AZURE_STORAGE_CONNECTION_STRING
*/

require('dotenv').config()
const names = require('../tables-queues.json')
const azure = require('azure-storage')

const queues = names['queues']
const tables = names['tables']

const tableService = azure.createTableService()
tableService.deleteTableIfExists(tables[0], (error, result, response) => {
  if (error) {
    console.error(error)
  }
})

tableService.createTableIfNotExists(tables[0], (error, result, response) => {
  if (error) {
    console.error(error)
  }
})

/*
tables.forEach(t => {
  console.log(t)
}) */
