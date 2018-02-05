'use strict'

const azureStorage = require('azure-storage')
const config = require('../../config')
let blobService

if (config.AZURE_STORAGE_CONNECTION_STRING) {
  blobService = azureStorage.createBlobService()
}

const service = {
  getBlobText: async (containerName, blobName) => {
    return new Promise((resolve, reject) => {
      if (!blobService) {
        return reject(new Error('Azure Storage Connection String required'))
      }
      blobService.getBlobToText(containerName, blobName, (error, text) => {
        if (error) return reject(error)
        return resolve(text)
      })
    })
  }
}

module.exports = service
