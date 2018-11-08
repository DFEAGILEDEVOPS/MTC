const qrCode = require('qrcode')

const qrService = {
  getDataURL: (url) => {
    if (!url) return null
    return new Promise((resolve, reject) => {
      qrCode.toDataURL(url,
        (error, url) => {
          if (error) reject(error)
          else return resolve(url)
        }
      )
    })
  }
}

module.exports = qrService
