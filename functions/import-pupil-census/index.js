'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')

module.exports = async function (context) {
  const start = performance.now()
  try {
    await v1.process(context)
  } catch (error) {
    context.log.error(`import-pupil-census: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`import-pupil-census: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
