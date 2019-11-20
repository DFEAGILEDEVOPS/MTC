#!/usr/bin/env node

'use strict'

require('dotenv').config()
const redis = require('../services/redis.service')
const { performance } = require('perf_hooks')
const exampleCheck = require('../pupil-api/preparedCheck')

const createChecks = async () => {
  const oneHourTtl = 3600
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
        ttl: oneHourTtl
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
  console.log(`${itemsCreated} preparedCheck entries added to redis in ${durationInMilliseconds} ms`)
}

createChecks()
