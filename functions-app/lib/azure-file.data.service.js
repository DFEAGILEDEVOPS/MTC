'use strict'
const azure = require('azure-storage')

const azureFileDataService = {
  azureUploadFromLocalFile: async function azureUploadFromLocalFile (container, remoteFilename, localFilename) {
    const blobService = azure.createBlobService()
    await new Promise((resolve, reject) => {
      blobService.createContainerIfNotExists(container, null, (error) => {
        if (error) { return reject(error) }
        resolve()
      })
    })
    await new Promise((resolve, reject) => {
      blobService.createBlockBlobFromLocalFile(container, remoteFilename, localFilename,
        (error, result) => {
          if (error) { return reject(error) }
          resolve(result)
        }
      )
    })

    // azure-storage: will return an `uploadBlobResult` for files < 40MB but a different object for files > 40MB
    // that only contains the numbers of the committedBlocks, mis-spelt with 3 M's.  Wonderful!
    // I can't see anyone actually needing that info, but the blob properties are definitely useful.
    return this.azureGetBlobProperties(container, remoteFilename)
  },

  azureCreateBlobFromText: async function azureCreateBlobFromText (container, remoteFilename, text) {
    const blobService = azure.createBlobService()
    await new Promise((resolve, reject) => {
      blobService.createContainerIfNotExists(container, null, (error) => {
        if (error) { return reject(error) }
        resolve()
      })
    })
    await new Promise((resolve, reject) => {
      blobService.createBlockBlobFromText(container, remoteFilename, text, (error, result) => {
        if (error) { return reject(error) }
        resolve(result)
      }
      )
    })

    // azure-storage: will return an `uploadBlobResult` for files < 40MB but a different object for files > 40MB
    // that only contains the numbers of the committedBlocks, mis-spelt with 3 M's.  Wonderful!
    // I can't see anyone actually needing that info, but the blob properties are definitely useful.
    return this.azureGetBlobProperties(container, remoteFilename)
  },

  /**
   * Get the properties for a blob
   * @param container
   * @param remoteFilename
   * @return {Promise<void>}
   */
  azureGetBlobProperties: async function azureGetBlobProperties (container, remoteFilename) {
    const blobService = azure.createBlobService()
    const blobProperties = await new Promise((resolve, reject) => {
      blobService.getBlobProperties(container, remoteFilename, function (error, result) {
        if (error) return reject(error)
        resolve(result)
      })
    })
    return blobProperties
  }
}

module.exports = azureFileDataService
