'use strict'

require('dotenv').config()
const config = require('./config')
let jobCount = 0

// example of node single thread worker that executes at specified interval
// could check the job table for new jobs and invoke import of data

function checkQueue () {
  console.log(`running job ${jobCount++}`)
}
console.log(`setting queue poll interval to ${config.pollInterval}`)
setInterval(checkQueue.bind(null), config.pollInterval)
