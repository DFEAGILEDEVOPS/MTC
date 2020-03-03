'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')

module.exports = async function (context, blob) {
  const start = performance.now()
  let meta
  try {
    meta = await v1.process(context, blob)
  } catch (error) {
    context.log.error(`census-import: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`census-import: ${timeStamp} processed ${meta.processCount} pupil records, run took ${durationInMilliseconds} ms`)
}
