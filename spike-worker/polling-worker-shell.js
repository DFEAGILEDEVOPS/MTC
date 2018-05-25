'use strict'

require('dotenv').config()
let jobCount = 0

// example of node single thread worker that executes at specified interval
// could check the job table for new jobs and invoke import of data

function checkTable () {
  console.log(`running job ${jobCount++}`)
}

setInterval(checkTable.bind(null), 1000)
