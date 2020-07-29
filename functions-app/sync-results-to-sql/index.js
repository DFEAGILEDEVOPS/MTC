'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')
const name = 'sync-results-to-sql'

module.exports = async function schoolImportIndex (context, myTimer) {
  const start = performance.now()
  context.log(`${name} started`)

  let meta
  try {
    meta = await v1.process(context.log)

    // Send a message saying this function has completed its run
    context.bindings.syncResultsToDbComplete = []
    context.bindings.syncResultsToDbComplete.push({
      completedAt: (new Date()).toISOString()
    })
  } catch (error) {
    meta = {}
    context.log.error(`${name}: ERROR: ${error.message}`, error)
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${meta.schoolsProcessed} schools and ${meta.checksProcessed} checks with ${meta.errors} errors, run took ${durationInMilliseconds} ms`)
}
