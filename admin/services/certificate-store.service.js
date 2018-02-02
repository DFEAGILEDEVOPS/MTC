const azureDataService = require('./data-access/azure-file.data.service')
const config = require('../config')

let tsoPublicKey, mtcPrivateKey

const service = {
  getTsoPublicKey: async () => {
    // cache after first call
    if (tsoPublicKey) {
      console.log('found in cache:', tsoPublicKey)
      return tsoPublicKey
    }

    if (config.Certificates.Azure.BlobContainer) {
      console.log('retrieiving...')
      const file = await azureDataService.azureDownloadFile()
      tsoPublicKey = file
      return tsoPublicKey
    }
    return config.Certificates.Local.NcaToolsPublicKey
  }
}

module.exports = service
