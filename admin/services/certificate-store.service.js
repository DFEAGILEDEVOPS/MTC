const azureBlobDataService = require('./data-access/azure-blob.data.service')
const config = require('../config')

let tsoPublicKey, mtcPrivateKey

const service = {
  getTsoPublicKey: async () => {
    // cache after first call
    if (tsoPublicKey) {
      return tsoPublicKey
    }

    if (config.Certificates.Azure.BlobContainer) {
      const file = await azureBlobDataService.getBlobText(config.Certificates.Azure.BlobContainer, config.Certificates.Azure.NcaToolsPublicKeyName)
      tsoPublicKey = file
      return tsoPublicKey
    }
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
