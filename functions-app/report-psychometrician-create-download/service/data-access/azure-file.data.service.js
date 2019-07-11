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
  await new Promise((resolve, reject) => {
    blobService.createBlockBlobFromLocalFile(container, remoteFilename, localFilename,
      (error, result) => {
        if (error) reject(error)
        else return resolve(result)
      }
    )
  })

  // azure-storage: will return an `uploadBlobResult` for files < 40MB but a different object for files > 40MB
  // that only contains the numbers of the committedBlocks, mis-spelt with 3 M's.  Wonderful!
  // I can't see anyone actually needing that info, but the blob properties are definitely useful.
  return azureGetBlobProperties(container, remoteFilename)
}

/**
 * Get the properties for a blob
 * @param container
 * @param remoteFilename
 * @return {Promise<void>}
 */
const azureGetBlobProperties = async (container, remoteFilename) => {
  const blobProperties = await new Promise((resolve, reject) => {
    blobService.getBlobProperties(container, remoteFilename, function (error, result) {
      if (error) return reject(error)
      resolve(result)
    })
  })
  return blobProperties
}

const service = config.AZURE_STORAGE_CONNECTION_STRING ? {
  azureUploadFile,
  azureUploadFromLocalFile,
  azureGetBlobProperties
} : {
  azureUploadFile: () => {
    return { name: 'test_error.csv' }
  },
  azureUploadFromLocalFile: () => {
    return { name: 'test_error.csv' }
  },
  azureGetBlobProperties: () => {
    return { name: 'testFileName', container: 'testContainer' }
  }
}

module.exports = service
