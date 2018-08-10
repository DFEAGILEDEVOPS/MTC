const qrCode = require('qrcode')
const monitor = require('../helpers/monitor')

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

module.exports = monitor('qr.service', qrService)
