#!/usr/bin/env node

'use strict'

require('dotenv').config()
const redis = require('../redis.service')
const { performance } = require('perf_hooks')

const createChecks = async () => {
  const schoolPinIndexBase = 10
  const schoolPinIndexLimit = 50
  let itemsCreated = 0
  const start = performance.now()
  for (let schoolPinIndex = schoolPinIndexBase; schoolPinIndex <= schoolPinIndexLimit; schoolPinIndex++) {
    let schoolPin = `abc${schoolPinIndex}def`
    for (let pupilPin = 1000; pupilPin < 10000; pupilPin++) {
      const cacheKey = `preparedCheck:${schoolPin}:${pupilPin}`
      const preparedCheck = {
        config: {
          practice: true
        }
      }
      redis.set(cacheKey, preparedCheck)
      itemsCreated++
    }
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  redis.quit()
  console.log(`${itemsCreated} preparedCheck entries added to redis in ${durationInMilliseconds} ms`)
}

createChecks()
