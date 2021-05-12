'use strict'

require('dotenv').config()
const Redis = require('ioredis')

const config = {
  Redis: {
    Host: process.env.REDIS_HOST || 'localhost',
    Port: Number(process.env.REDIS_PORT),
    Key: process.env.REDIS_KEY,
    useTLS: true
  }
}

const options = {
  port: Number(config.Redis.Port),
  host: config.Redis.Host,
  password: config.Redis.Key,
  maxRetriesPerRequest: 1
}
if (config.Redis.useTLS) {
  options.tls = {
    host: config.Redis.Host
  }
}

let redis

try {
  console.log('connecting...')
  redis = new Redis(options)
  console.log('setting...')
  redis.set('foo', 'bar')
    .then((res) => {
      console.log('set!')
    })
    .catch((e) => {
      console.error('set error...')
      console.error(e)
    })
} catch (error) {
  console.log('GENERAL ERROR :-(')
  console.error(error.message)
}

console.log('FINISHED')


