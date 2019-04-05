'use strict'

import config from '../config'
const whitelist = config.Cors.Whitelist.split(',')

const options = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      return callback(null, true)
    } else {
      return callback(new Error(`CORS policy does not allow ${origin}`))
    }
  }
}

module.exports = options
