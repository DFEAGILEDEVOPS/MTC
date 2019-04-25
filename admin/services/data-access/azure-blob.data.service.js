'use strict'

const azureStorage = require('azure-storage')
const bluebird = require('bluebird')
const config = require('../../config')

let blobService

if (config.AZURE_STORAGE_CONNECTION_STRING) {
  blobService = azureStorage.createBlobService()
} else {
  blobService = {}
}

bluebird.promisifyAll(blobService, {
  promisifier: (originalFunction) => function (...args) {
    return new Promise((resolve, reject) => {
      try {
        originalFunction.call(this, ...args, (error, result, response) => {
          if (error) {
            return reject(error)
          }
          return resolve(result)
        })
      } catch (error) {
        return reject(error)
      }
    })
  }
})

module.exports = blobService
