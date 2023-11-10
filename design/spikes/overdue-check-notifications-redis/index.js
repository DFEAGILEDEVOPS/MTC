'use strict'

require('dotenv').config()
const Redis = require('ioredis')
const config = require('./config')
const redis = new Redis(config)
const R = require('ramda')
const pipeline = redis.pipeline()
const perf = require('perf_hooks').performance

// perf timers
let overallTimerStart
let overallTimerEnd
let fetchExistingOverdueSchoolsTimerStart
let fetchExistingOverdueSchoolsTimerEnd
let addNewOverdueChecksTimerStart
let addNewOverdueChecksTimerEnd
let setWorkTimerStart
let setWorkTimerEnd

// TODO work with sets?

const keyPrefix = 'school.home.overdue'
const schoolCount = 20000

function flushRedis (done) {
  redis.flushall(done)
}

function clearRedis (done) {
  console.log('purging redis...')
  var stream = redis.scanStream({
    match: `${keyPrefix}:*`
  })

  const keyLengths = []
  stream.on('data', function (keys) {
    if (keys.length) {
      keyLengths.push(keys.length)
      var pipeline = redis.pipeline()
      keys.forEach(function (key) {
        pipeline.del(key)
      })
      pipeline.exec()
    }
  })
  stream.on('end', function () {
    const average = keyLengths.reduce((a, b) => a + b, 0) / keyLengths.length
    console.log('redis purged - average key batch length: ', average.toFixed(0))
    done()
  })
}

function fetchExistingOverdueSchools (items, done) {
  fetchExistingOverdueSchoolsTimerStart = perf.now()
  var stream = redis.scanStream({
    match: `${keyPrefix}:*`
  })

  stream.on('data', function (keys) {
    if (keys.length) {
      items.push(...keys)
    }
  })
  stream.on('end', function () {
    fetchExistingOverdueSchoolsTimerEnd = perf.now()
    done()
  })
}

function generateArrayOfRandomNumbers (min, max, length = 1) {
  return Array.from(
    { length},
    () => Math.floor(Math.random() * (max - min + 1)) + min
  )
}

function outputTimings () {
  const msToSecs = (ms) => (ms/1000).toFixed(2)
  const fetchExistingMs = fetchExistingOverdueSchoolsTimerEnd - fetchExistingOverdueSchoolsTimerStart
  const addNewMs = addNewOverdueChecksTimerEnd - addNewOverdueChecksTimerStart
  const setWorkMs = setWorkTimerEnd - setWorkTimerStart
  const overallMs = overallTimerEnd - overallTimerStart
  console.log(`fetch existing from redis: ${fetchExistingMs.toFixed(2)}ms (${msToSecs(fetchExistingMs)}s)`)
  console.log(`add new to redis: ${addNewMs.toFixed(2)}ms (${msToSecs(addNewMs)}s)`)
  console.log(`set work duration: ${setWorkMs.toFixed(2)}ms (${msToSecs(setWorkMs)}s)`)
  console.log(`overall duration: ${overallMs.toFixed(2)}ms (${msToSecs(overallMs)}s)`)
}

function runDataExercise () {
  flushRedis(() => {
    console.log('starting exercise...')
    // datasets
    const oldOverdueSchools = generateArrayOfRandomNumbers(1, schoolCount * 2, schoolCount)
    const currentOverdueSchools = generateArrayOfRandomNumbers(1, schoolCount * 2, schoolCount)

    // add oldOverdueChecks to redis - dont measure this
    oldOverdueSchools.forEach((schoolUuid) => {
      pipeline.set(`${keyPrefix}:${schoolUuid}`, 'old')
    })
    pipeline.exec()

    console.log(`configured school count: ${schoolCount}`)
    const existingOverdueChecks = []

    fetchExistingOverdueSchools(existingOverdueChecks, () => {
      setWorkTimerStart = perf.now()
      const noLongerOverdue = R.difference(oldOverdueSchools, currentOverdueSchools)
      const stillOverdue = R.difference(oldOverdueSchools, noLongerOverdue)
      const newOverdue = R.difference(currentOverdueSchools, stillOverdue)
      setWorkTimerEnd = perf.now()
      console.log(`noLongerOverdue: ${noLongerOverdue.length}`)
      console.log(`stillOverdue: ${stillOverdue.length}`)
      console.log(`newOverdue: ${newOverdue.length}`)

      // remove noLongerOverdue from redis
      noLongerOverdue.forEach((schoolUuid) => {
        pipeline.del(`${keyPrefix}:${schoolUuid}`)
      })
      pipeline.exec()

      // add newOverdue to redis
      addNewOverdueChecksTimerStart = perf.now()
      newOverdue.forEach((schoolUuid) => {
        pipeline.set(`${keyPrefix}:${schoolUuid}`, 'new')
      })
      pipeline.exec()
      addNewOverdueChecksTimerEnd = perf.now()
      overallTimerEnd = perf.now()
      console.log('exercise complete')
      outputTimings()
    })
  })
}

redis.ping().then(() => {
  console.log('Redis is connected')
  overallTimerStart = perf.now()
  runDataExercise()
// process.exit()
}).catch((err) => {
  console.log('Redis is not connected')
})
