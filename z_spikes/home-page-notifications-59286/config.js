'use strict'

const config = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || 'localhost',
  password: process.env.REDIS_KEY || undefined,
}

if (process.env.REDIS_USE_TLS) {
  config.tls = {
    host: process.env.REDIS_HOST
  }
}

module.exports = config
