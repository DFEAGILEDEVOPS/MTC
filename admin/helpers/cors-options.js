'use strict'

const config = require('../config')
const whitelist = config.Cors.Whitelist.split(',')

const options = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy does not allow ${origin}`))
    }
  }
}

module.exports = options
