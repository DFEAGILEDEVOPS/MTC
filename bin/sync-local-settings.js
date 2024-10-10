#!/usr/bin/env node
'use strict'

/**
 * sync-local-settings.js : developer Utility script
 * Synchronise Azure connection strings from the master (.env at project root) down into the functions
 * local-settings.json files.
 */

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')
const editJsonFile = require('../admin/node_modules/edit-json-file')
const targetFilename = 'local.settings.json'
const targetDirs = [
    'func-ps-report',
    'func-consumption',
    'func-throttled'
]

// The keys we want to get/set in the JSON file
const AzureWebJobsStorage = 'AzureWebJobsStorage'
const AZURE_STORAGE_CONNECTION_STRING = 'AZURE_STORAGE_CONNECTION_STRING'
const AZURE_SERVICE_BUS_CONNECTION_STRING = 'AZURE_SERVICE_BUS_CONNECTION_STRING'

function syncSetting (file, key, expectedValue) {
  if (file.get(key) !== expectedValue) {
    console.error(`${key} is incorrect, overwriting with value from .env`)
    console.log('Found value ' + file.get(key))
    console.log('Expected value ' + expectedValue)
    file.set(key, expectedValue)
  }
}

function makeValuesKey (str) {
  return 'Values.' + str
}

function syncDir (dir){
  const fname = path.join(__dirname, '..', dir, targetFilename)
  console.log(`\nEditing file ${fname}`)
  let file = editJsonFile(fname)
  file.set('IsEncrypted', false)

  const AzureWebJobsStorageKey = makeValuesKey(AzureWebJobsStorage)
  const AzureStorageConnectionStringKey = makeValuesKey(AZURE_STORAGE_CONNECTION_STRING)
  const AzureServiceBusConnectionStringKey = makeValuesKey(AZURE_SERVICE_BUS_CONNECTION_STRING)

  /**
   * Technically, not every function needs the service bus string, but it seems simpler just to add it.
   */

  syncSetting(file, AzureWebJobsStorageKey, process.env[AZURE_STORAGE_CONNECTION_STRING])
  syncSetting(file, AzureStorageConnectionStringKey, process.env[AZURE_STORAGE_CONNECTION_STRING])
  syncSetting(file, AzureServiceBusConnectionStringKey, process.env[AZURE_SERVICE_BUS_CONNECTION_STRING])

  file.save()
}

function main () {
  try {
    if (fs.existsSync(globalDotEnvFile)) {
      require('../admin/node_modules/dotenv').config({ path: globalDotEnvFile })
    } else {
      console.log('No .env file found at project root')
    }
  } catch (error) {
    console.error(error)
  }
  // process.env now loaded from .env file

  for (const dir of targetDirs) {
     syncDir(dir)
  }
}

main()
