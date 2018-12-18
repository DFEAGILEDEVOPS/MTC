'use strict'

const moment = require('moment')
const uuid = require('uuid/v4')

const v1 = require('./v1.js')

/**
 * Write to Table Storage for fast pupil authentication
 * Reads from a queue
 * @param context
 * @param {Object} prepareCheckMessage
 */
module.exports = async function (context, prepareCheckMessage) {
  context.log('prepare-check: message received', prepareCheckMessage.checkCode)

  switch (parseInt(prepareCheckMessage.version, 10)) {
    case 1:
      try {
        await v1.process(context, prepareCheckMessage)
        break
      } catch (error) {
        context.log.error(`prepared-check-sync: ERROR: failed to process message version:${prepareCheckMessage.version} for ${prepareCheckMessage.checkCode}`)
        throw error
      }
    default:
      throw new Error('Unknown message version')
  }

  const outputProp = 'data'
  context.bindings[outputProp] = []
  context.bindings[outputProp].push({
    PartitionKey: prepareCheckMessage.checkCode,
    RowKey: uuid(),
    eventType: 'check-prepare',
    payload: JSON.stringify(prepareCheckMessage),
    processedAt: moment().toDate()
  })
}
