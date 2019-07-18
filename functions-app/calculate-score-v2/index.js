'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')

module.exports = async function (context) {
  const start = performance.now()
  try {
    await v1.process(context)
  } catch (error) {
    context.log.error(`calculate-score-v2: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`calculate-score-v2: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
