'use strict'

const { performance } = require('perf_hooks')
const functionName = 'check-validator'
const v1 = require('./v1')
const sleepDuration = 10000

module.exports = async (context, checkToValidate) => {
  /*
    check receiver has 2 output bindings - the check-validation queue and the receivedCheck table
    sometimes this function can receive the message before the receivedCheck entry is updated.
    Therefore we must sleep for a short duration to allow the insert to complete.
  */
  context.log(`sleeping for ${sleepDuration}ms to allow receivedCheck to persist`)
  // await sleep(sleepDuration)
  context.log(`awake now, processing validation...`)
  const start = performance.now()
  const version = parseInt(checkToValidate.version, 10)
  context.log.info(`${functionName}: version:${version} message received for checkCode ${checkToValidate.checkCode}`)
  try {
    await v1.process(context, checkToValidate)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
