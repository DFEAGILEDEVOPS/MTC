'use strict'

require('dotenv').config()
const Stopwatch = require('node-stopwatch').Stopwatch

console.log('ticks: ' + stopwatch.elapsedTicks)
console.log('milliseconds: ' + stopwatch.elapsedMilliseconds)
console.log('seconds: ' + stopwatch.elapsed.seconds)
console.log('minutes: ' + stopwatch.elapsed.minutes)
console.log('hours: ' + stopwatch.elapsed.hours)

function checkTable () {
  const stopwatch = Stopwatch.create()
  stopwatch.start()
  console.log(`reading csv file`)
  stopwatch.stop()
  console.log(`reading csv took {$stopwatch.elapsed.seconds}`)
  stopwatch.reset()
  stopwatch.start()
  console.log(`invoking bulk import with csv payload`)
  stopwatch.stop()
  console.log(`bulk import took {$stopwatch.elapsed.seconds}`)
}

setInterval(checkTable.bind(null), 1000)
