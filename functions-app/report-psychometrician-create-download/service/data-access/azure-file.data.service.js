'use strict'

const azure = require('azure-storage')
const config = require('../../../config')

const blobService = config.AZURE_STORAGE_CONNECTION_STRING ? azure.createBlobService() : {
  createBlockBlobFromText: () => { return { name: 'test_error.csv' } },
  getBlobToText: () => 'text',
  getBlobToStream: (container, blob, fStream, cb) => {
    fStream.write('binary')
    fStream.end()
    cb()
  },
  createContainerIfNotExists: () => {}
}

const azureUploadFile = async (container, remoteFilename, text, streamLength) => {
  await new Promise((resolve, reject) => {
    blobService.createContainerIfNotExists(container, null, (error) => {
      if (error) reject(error)
      resolve()
    })
  })
  const pr = await new Promise((resolve, reject) => {
    blobService.createBlockBlobFromText(container, remoteFilename, text, streamLength,
      (error, result) => {
        if (error) reject(error)
        else return resolve(result)
      }
    )
  })
  return pr
}

const azureUploadFromLocalFile = async (container, remoteFilename, localFilename) => {
  await new Promise((resolve, reject) => {
    blobService.createContainerIfNotExists(container, null, (error) => {
      if (error) reject(error)
      resolve()
    })
  })
  const pr = await new Promise((resolve, reject) => {
    blobService.createBlockBlobFromLocalFile(container, remoteFilename, localFilename,
      (error, result) => {
        if (error) reject(error)
        else return resolve(result)
      }
    )
  })
  return pr
}

const service = config.AZURE_STORAGE_CONNECTION_STRING ? {
  azureUploadFile,
  azureUploadFromLocalFile
} : {
  azureUploadFile: () => {
    return { name: 'test_error.csv' }
  },
  azureUploadFromLocalFile: () => {
    return { name: 'test_error.csv' }
  }
}

module.exports = service
