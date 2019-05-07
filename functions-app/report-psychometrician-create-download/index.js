'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')
const name = 'report-psychometrician-create-download'

module.exports = async function (context, message) {
  const start = performance.now()

  let meta
  try {
    meta = await v1.process(context)
  } catch (error) {
    context.log.error(`${name}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${meta.processCount} checks, run took ${durationInMilliseconds} ms`)
}
