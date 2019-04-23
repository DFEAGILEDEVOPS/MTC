'use strict'

const { performance } = require('perf_hooks')

const v1 = require('./v1')
const name = 'feedback'

module.exports = async function (context, timer) {
  const start = performance.now()
  let meta
  try {
    meta = await v1.process(context.log)
  } catch (error) {
    context.log.error(`${name}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} run complete: processed ${meta.messageCount} check(s) in ${durationInMilliseconds} ms`)
}
