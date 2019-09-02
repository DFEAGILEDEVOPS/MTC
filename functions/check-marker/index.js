'use strict'

const { performance } = require('perf_hooks')
const functionName = 'check-marker'
const v1 = require('./v1')

module.exports = async (context, checkToMark) => {
  const start = performance.now()
  const version = parseInt(checkToMark.version, 10)
  context.log.info(`${functionName}: version:${version} message received for checkCode ${checkToMark.checkCode}`)
  try {
    if (version !== 1) {
      throw new Error(`Message schema version:${version} unsupported`)
    }
    await v1.process(context, checkToMark)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
