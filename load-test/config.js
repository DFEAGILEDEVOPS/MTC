'use strict'

module.exports = {
  Redis: {
    Host: process.env.REDIS_HOST || 'localhost',
    Port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    Key: process.env.REDIS_KEY,
    useTLS: process.env.REDIS_TLS || false
  }
}
