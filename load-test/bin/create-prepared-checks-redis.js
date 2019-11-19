#!/usr/bin/env node

'use strict'

require('dotenv').config()
const redis = require('../redis.service')

const createChecks = async () => {
  const schoolPinIndexBase = 10
  const schoolPinIndexLimit = 16
  let itemsCreated = 0

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
  redis.quit()
  console.log(`${itemsCreated} preparedChecks added to redis`)
}

createChecks()
