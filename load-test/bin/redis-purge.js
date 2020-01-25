#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const config = require('../config')
const Redis = require('ioredis')
const readline = require('readline')

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const flushAll = async () => {
  const redis = new Redis(redisConfig)
  await redis.flushall()
  redis.quit()
}

rl.question(`This will delete ALL data from the redis instance ${config.Redis.Host}.  Are you sure? Y/N `, (answer) => {
  // TODO: Log the answer in a database
  if (answer === 'Y') {
    rl.close()
    flushAll()
  } else {
    console.log('aborting...')
    process.exit()
  }
})
