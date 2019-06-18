'use strict'

const { performance } = require('perf_hooks')
const functionName = 'completed-checks'
const v1 = require('./v1')
const v2 = require('./v2')

module.exports = async function (context, completedCheckMessage) {
  const start = performance.now()
  const version = parseInt(completedCheckMessage.version, 10)
  context.log.info(`${functionName}: version:${version} message received for checkCode ${completedCheckMessage.checkCode}`)
  try {
    switch (version) {
      case 1:
        await v1.process(context, completedCheckMessage)
        break
      case 2:
        await v2.process(context, completedCheckMessage)
        break
      default:
        // v1 messages did not have a version property
        await v1.process(context, completedCheckMessage)
    }
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`completed-checks: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
