'use strict'
const { performance } = require('perf_hooks')

const v1 = require('./v1')
const name = 'school-results-cache-load'

module.exports = async function (context, myTimer) {
  const start = performance.now()
  context.log(`${name} started`)

  let meta
  try {
    meta = await v1.process(context)
  } catch (error) {
    meta = { processCount: 'n/a' }
    context.log.error(`${name}: ERROR: ${error.message}`, error)
  }

  const end = performance.now()
  const durationInMinutes = Math.round((end - start) / 1000 / 60)
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${meta.processCount} schools, with ${meta.errorCount} failures, run took ${durationInMinutes} minutes`)
}
