'use strict'

const sqlService = require('./sql.service')
const logger = require('./logger')
const executionCount = 10

const function1 = async () => {
  for (let index = 0; index < executionCount; index++) {
    const result = await sqlService.query('SELECT 1 as [value]')
    console.log(result)
  }
}

const function2 = async () => {
  console.log('function2')
}

async function main () {
  let connected = true
  let backOff = 2 // milliseconds
  let startTime
  do {
    startTime = new Date()
    try {
      logger.warn('Attempting to initialise the connection pool')
      await sqlService.initPool()
      connected = true
    } catch (error) {
      // await sleep(2000)
      // process.exit(1)
      await sqlService.drainPool()
      sqlService.pool = null
      logger.warn('Failed to connect to the database: ' + error.message)
      logger.warn('Backing off for ' + backOff + 'ms ')
      await sleep(backOff)
      backOff = backOff * 2
      connected = false
    }
  } while (!connected)
  await function1()
}

;(async function () {
  try {
    await main()
  } catch (error) {
    console.error(error)
  }
})()
