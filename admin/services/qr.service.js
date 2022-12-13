const qrCode = require('qrcode')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')

const qrService = {
  getDataURL: async (url) => {
    if (!url) return null
    const cachedData = await redisCacheService.get(redisKeyService.getQrCodeUrlPrefix(url))
    if (cachedData !== undefined) return cachedData
    return new Promise((resolve, reject) => {
      qrCode.toDataURL(url,
        async (error, qrCodeData) => {
          if (error) {
            reject(error)
          } else {
            await redisCacheService.set(redisKeyService.getQrCodeUrlPrefix(url))
            return resolve(qrCodeData)
          }
        }
      )
    })
  }
}

module.exports = qrService
