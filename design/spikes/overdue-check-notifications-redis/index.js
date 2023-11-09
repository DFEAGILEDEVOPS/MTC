const Redis = require('ioredis')
const redis = new Redis()
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

// TODO connect to azure redis

const keyPrefix = 'school.home.overdue'
const schoolCount = 150000

function clearRedis (cb) {
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
    cb()
  })
}

function randomIntArrayInRange (min, max, length = 1) {
  return Array.from(
    { length},
    () => Math.floor(Math.random() * (max - min + 1)) + min
  )
}

function outputTimings () {
  console.log(`fetch existing from redis: ${((fetchExistingOverdueSchoolsTimerEnd - fetchExistingOverdueSchoolsTimerStart)/1000).toFixed(2)}s`)
  console.log(`add new to redis: ${((addNewOverdueChecksTimerEnd - addNewOverdueChecksTimerStart)/1000).toFixed(2)}s`)
  console.log(`set work duration: ${((setWorkTimerEnd - setWorkTimerStart)/1000).toFixed(2)}s`)
  console.log(`overall duration: ${((overallTimerEnd - overallTimerStart)/1000).toFixed(2)}s`)
}

function runDataExercise () {
  clearRedis(() => {
    console.log('starting exercise...')
    // datasets
    const oldOverdueSchools = randomIntArrayInRange(1, schoolCount * 2, schoolCount)
    const currentOverdueSchools = randomIntArrayInRange(1, schoolCount * 2, schoolCount)

    // add oldOverdueChecks to redis (dont measure this)
    oldOverdueSchools.forEach((schoolUuid) => {
      pipeline.set(`${keyPrefix}:${schoolUuid}`, 'old')
    })
    pipeline.exec()

    // TODO fetch existing overdue checks first
    fetchExistingOverdueSchoolsTimerStart = NaN
    fetchExistingOverdueSchoolsTimerEnd = NaN

    console.log(`configured school count: ${schoolCount}`)
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
    outputTimings()
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
