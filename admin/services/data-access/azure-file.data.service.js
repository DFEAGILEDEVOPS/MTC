const azure = require('azure-storage')
const config = require('../../config')
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

const azureDownloadFile = async (container, blob) => {
  const file = await new Promise((resolve, reject) => {
    blobService.getBlobToText(container, blob,
      (error, result) => {
        if (error) reject(error)
        else return resolve(result)
      }
    )
  })
  return file
}

const azureDownloadFileStream = async (container, blob, stream) => {
  const file = await new Promise((resolve, reject) => {
    blobService.getBlobToStream(container, blob, stream,
      (error, result) => {
        if (error) reject(error)
        else return resolve()
      }
    )
  })
  return file
}

module.exports = config.AZURE_STORAGE_CONNECTION_STRING ? {
  azureUploadFile,
  azureDownloadFile,
  azureDownloadFileStream
} : {
  azureUploadFile: () => {
    return { name: 'test_error.csv' }
  },
  azureDownloadFile: () => 'text',
  azureDownloadFileStream: (container, blob, fStream) => {
    fStream.write('binary')
    fStream.end()
  }
}
