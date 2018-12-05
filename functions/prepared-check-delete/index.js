'use strict'

const { performance } = require('perf_hooks')
const uuid = require('uuid/v4')
const moment = require('moment')

const v1 = require('./v1')

module.exports = async function (context, queueMessage) {
  const start = performance.now()

  switch (queueMessage.version) {
    case 1:
      try {
        await v1.process(context.log, queueMessage)
        break
      } catch (error) {
        context.log.error(`delete-prepared-check: ERROR: failed to process message version:${queueMessage.version} for ${queueMessage.checkCode}`)
        context.log.error(`delete-prepared-check: ERROR: ${error.message}`)
        throw error
      }
    default:
      throw new Error('Unknown message version')
  }

  // Default output is bound to the pupilEvents table (saved in table storage)
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: queueMessage.checkCode,
    RowKey: uuid(),
    eventType: 'delete-prepared-check',
    payload: JSON.stringify(queueMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`delete-prepared-check: ${timeStamp} run complete: expired check [${queueMessage.checkCode}] in ${durationInMilliseconds} ms`)
}
