'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')

module.exports = async function (context, completedCheckMessage) {
  const start = performance.now()
  try {
    await v1.process(context, completedCheckMessage)
  } catch (error) {
    context.log.error(`completed-checks: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`completed-checks: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
