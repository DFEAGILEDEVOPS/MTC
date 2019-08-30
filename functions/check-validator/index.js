'use strict'

const { performance } = require('perf_hooks')
const functionName = 'check-validator'
const v1 = require('./v1')

module.exports = async (context, checkToValidate) => {
  /*
    check receiver has 2 output bindings - the check-validation queue and the receivedCheck table.
    this function receives the message before the receivedCheck entry is updated and the filter binding
    for the receivedCheck lookup fails first time.
    TODO experiment with azure storage library for lookup
  */
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
