'use strict'

const { performance } = require('perf_hooks')
const uuid = require('uuid/v4')

const v1 = require('./v1.js')
const v2 = require('./v2.js')

/**
 * Write to Table Storage for fast pupil authentication
 * Reads from a queue
 * @param context
 * @param {Object} prepareCheckMessage
 */
module.exports = async function (context, prepareCheckMessage) {
  context.log(`prepare-check: version:${prepareCheckMessage.version} message received`)
  const start = performance.now()

  const outputProp = 'data'
  context.bindings[outputProp] = []
  let meta

  switch (parseInt(prepareCheckMessage.version, 10)) {
    case 1:
      try {
        meta = await v1.process(context, prepareCheckMessage)
        context.bindings[outputProp].push({
          PartitionKey: prepareCheckMessage.checkCode,
          RowKey: uuid(),
          eventType: 'check-prepare',
          payload: JSON.stringify(prepareCheckMessage),
          processedAt: new Date()
        })
        break
      } catch (error) {
        context.log.error(`prepare-check: ERROR: failed to process message version:${prepareCheckMessage.version}: ${error.message}`)
        throw error
      }
    case 2:
      try {
        meta = await v2.process(context, prepareCheckMessage)
        for (const msg of prepareCheckMessage.messages) {
          context.bindings[outputProp].push({
            PartitionKey: msg.checkCode,
            RowKey: uuid(),
            eventType: 'check-prepare',
            payload: JSON.stringify(msg),
            processedAt: new Date()
          })
        }
        break
      } catch (error) {
        context.log.error(`prepare-check: ERROR: failed to process message version:${prepareCheckMessage.version}: ${error.message}`)
        throw error
      }
    default:
      throw new Error('Unknown message version')
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`prepare-check: ${timeStamp} processed ${meta.processCount} checks, run took ${durationInMilliseconds} ms`)
}
