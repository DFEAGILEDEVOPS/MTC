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
const redis = require('../services/redis.service')
const { performance } = require('perf_hooks')
const exampleCheck = require('./preparedCheck')

const createChecks = async () => {
  const twoDaysInSeconds = 172800
  const schoolPinIndexBase = 10
  const schoolPinIndexLimit = 50
  let itemsCreated = 0
  const start = performance.now()
  for (let schoolPinIndex = schoolPinIndexBase; schoolPinIndex <= schoolPinIndexLimit; schoolPinIndex++) {
    const preparedChecks = []
    let schoolPin = `abc${schoolPinIndex}def`
    for (let pupilPin = 1000; pupilPin < 10000; pupilPin++) {
      const cacheKey = `preparedCheck:${schoolPin}:${pupilPin}`
      const cacheItem = {
        key: cacheKey,
        value: exampleCheck,
        ttl: twoDaysInSeconds
      }
      preparedChecks.push(cacheItem)
      itemsCreated++
    }
    console.log(`persisting batch ${schoolPin}`)
    await redis.setMany(preparedChecks)
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  redis.quit()
  console.log(`${itemsCreated} preparedCheck entries added to redis in ${durationInMilliseconds} ms, with TTL of ${twoDaysInSeconds / 60} minutes`)
}

createChecks()
