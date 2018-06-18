'use strict'

const config = require('../config')
const whitelist = config.Cors.Whitelist.split(',')

const options = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true)
    } else if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    } else {
      return callback(new Error(`CORS policy does not allow ${origin}`))
    }
  }
}

module.exports = options
