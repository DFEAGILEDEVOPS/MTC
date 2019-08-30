'use strict'

const { performance } = require('perf_hooks')
const functionName = 'check-receiver'
const v3 = require('./v3')

module.exports = async (context, completedCheck) => {
  const start = performance.now()
  const version = parseInt(completedCheck.version, 10)
  context.log.info(`${functionName}: version:${version} message received for checkCode ${completedCheck.checkCode}`)
  try {
    if (version !== 3) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
    await v3.process(context, completedCheck)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
