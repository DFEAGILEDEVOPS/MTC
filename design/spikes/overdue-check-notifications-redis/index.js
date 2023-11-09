const Redis = require('ioredis')
const redis = new Redis()
const R = require('ramda')
const pipeline = redis.pipeline()
const perf = require('perf_hooks')
// TODO add perf timings to output
// TODO connect to azure redis

const keyPrefix = 'school.home.overdue'
const checkCount = 150000

function clearRedis (cb) {
  var stream = redis.scanStream({
    match: `${keyPrefix}:*`
  })
  stream.on('data', function (keys) {
    // TODO render an average of key batch length at end
    if (keys.length) {
      console.log(`length of keys batch: ${keys.length}`)
      var pipeline = redis.pipeline()
      keys.forEach(function (key) {
        pipeline.del(key)
      })
      pipeline.exec()
    }
  })
  stream.on('end', function () {
    console.log('redis purged')
    cb()
  })
}

function randomIntArrayInRange (min, max, length = 1) {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
}

function runDataExercise () {
  clearRedis(() => {
    console.log('starting data exercise')
    // datasets
    const oldOverdueChecks = randomIntArrayInRange(1, checkCount * 2, checkCount)
    const currentOverdueChecks = randomIntArrayInRange(1, checkCount * 2, checkCount)

    // add oldOverdueChecks to redis (dont measure this)
    oldOverdueChecks.forEach((schoolUuid) => {
      pipeline.set(`${keyPrefix}:${schoolUuid}`, 'old')
    })
    pipeline.exec()

    // TODO start timing here, and fetch existing overdue checks first

    console.log(`oldOverdueChecks in redis: ${oldOverdueChecks.length}`)
    console.log(`currentOverdueChecks from query: ${currentOverdueChecks.length}`)
    // get the items in oldOverdueChecks that are not in newOverdueChecks
    const noLongerOverdue = R.difference(oldOverdueChecks, currentOverdueChecks)
    console.log(`noLongerOverdue: ${noLongerOverdue.length}`)
    const stillOverdue = R.difference(oldOverdueChecks, noLongerOverdue)
    console.log(`stillOverdue: ${stillOverdue.length}`)
    const newOverdue = R.difference(currentOverdueChecks, stillOverdue)
    console.log(`newOverdue: ${newOverdue.length}`)

    // remove noLongerOverdue from redis
    noLongerOverdue.forEach((schoolUuid) => {
      pipeline.del(`${keyPrefix}:${schoolUuid}`)
    })
    pipeline.exec()

    // add newOverdue to redis
    newOverdue.forEach((schoolUuid) => {
      pipeline.set(`${keyPrefix}:${schoolUuid}`, 'new')
    })
    pipeline.exec()
  })
}

redis.ping().then(() => {
  console.log('Redis is connected')
  runDataExercise()
}).catch((err) => {
  console.log('Redis is not connected')
})
