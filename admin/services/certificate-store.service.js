const azureBlobDataService = require('./data-access/azure-blob.data.service')
const config = require('../config')

let ncaPublicKey, mtcPrivateKey
let callCount = 0

const service = {
  getNcaPublicKey: async () => {
    // cache after first call
    console.log('call index:', callCount++)
    if (ncaPublicKey) {
      console.log('value cached, returning')
      return ncaPublicKey
    }
    console.log('value not cached')
    if (config.Certificates.Azure.BlobContainer) {
      console.log('retrieving from azure...')
      const file = await azureBlobDataService.getBlobText(config.Certificates.Azure.BlobContainer, config.Certificates.Azure.NcaToolsPublicKeyName)
      ncaPublicKey = file
      return ncaPublicKey
    }
    console.log('returning local env var')
    return config.Certificates.Local.NcaToolsPublicKey
  },
  getMtcPrivateKey: async () => {
    // cache after first call
    if (mtcPrivateKey) {
      return mtcPrivateKey
    }

    if (config.Certificates.Azure.BlobContainer) {
      const file = await azureBlobDataService.getBlobText(config.Certificates.Azure.BlobContainer, config.Certificates.Azure.MtcPrivateKeyName)
      mtcPrivateKey = file
      return mtcPrivateKey
    }
    return config.Certificates.Local.MtcPrivateKey
  }
}

module.exports = service
