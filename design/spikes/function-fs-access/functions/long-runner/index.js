'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')
const functionName = 'longRunner'

module.exports = async function (context) {
  const start = performance.now()

  try {
    await v1.process(context.log)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete in ${durationInMilliseconds} ms`)
}
