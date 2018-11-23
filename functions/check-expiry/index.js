'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')

module.exports = async function (context, message) {
  const start = performance.now()

  let meta
  try {
    meta = v1.process(context.log)
  } catch (error) {
    context.log.error(`check-expiry: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`check-expiry: ${timeStamp} processed ${meta.processCount} checks, run took ${durationInMilliseconds} ms`)
}
