'use strict'

const { performance } = require('perf_hooks')

const v2 = require('./v2')
const name = 'report-psychometrician'

module.exports = async function (context, blob) {
  const start = performance.now()

  let meta
  try {
    meta = await v2.process(context.log, blob)
  } catch (error) {
    context.log.error(`${name}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${meta.processCount} checks, run took ${durationInMilliseconds} ms`)
}
