#!/usr/bin/env node

'use strict'

require('dotenv').config()
const config = require('../config')
const Redis = require('ioredis')

const redisConfig = {
  port: config.Redis.Port,
  host: config.Redis.Host
}
if (config.Redis.Key) {
  redisConfig.password = config.Redis.Key
}
if (config.Redis.useTLS) {
  redisConfig.tls = { host: config.Redis.Host }
}

const redis = new Redis(redisConfig)

const flusAll = async () => {
  await redis.flushall()
  redis.quit()
}

flusAll()
