'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')
const name = 'school-import'

module.exports = async function schoolImportIndex (context, blob) {
  const start = performance.now()
  context.log(`${name} started for blob \n Name: ${context.bindingData.name} \n Blob Size: ${blob.length} Bytes`)

  let meta
  try {
    meta = await v1.process(context, blob)
  } catch (error) {
    meta = { processCount: 'n/a' }
    context.log.error(`${name}: ERROR: ${error.message}`, error)
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${meta.processCount} checks, run took ${durationInMilliseconds} ms`)
}
