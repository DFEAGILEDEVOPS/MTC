'use strict'

require('dotenv').config()

let jobCount = 0

function checkTable () {
  console.log(`running job ${jobCount++}`)
  // 1. read job table
  // 2. find job
  // 3. put messages on bus for job workers
  // 4. rinse & repeat
}

setInterval(checkTable.bind(null), 1000)
