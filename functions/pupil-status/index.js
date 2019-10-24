'use strict'

const uuid = require('uuid/v4')
const { performance } = require('perf_hooks')
const v1 = require('./v1')
const v2 = require('./v2')

/**
 * Re-compute the pupil status and write it to the Admin database
 * @param context
 * @param pupilStatusMessage
 * @return {Promise<void>}
 */
module.exports = async function (context, pupilStatusMessage) {
  context.log(`pupil-status: version:${pupilStatusMessage.version} message received`)
  const start = performance.now()
  let meta
  context.bindings.pupilEventsTable = []

  if (typeof pupilStatusMessage !== 'object') {
    throw new Error('pupil-status: Badly formed message')
  }

  switch (parseInt(pupilStatusMessage.version, 10)) {
    case 1:
      try {
        meta = await v1.process(context, pupilStatusMessage)
        context.bindings.pupilEventsTable.push({
          PartitionKey: pupilStatusMessage.checkCode,
          RowKey: uuid(),
          eventType: 'pupil-status',
          payload: JSON.stringify(pupilStatusMessage),
          processedAt: new Date()
        })
        break
      } catch (error) {
        context.log.error(`pupil-status: ERROR: failed to process message version:${pupilStatusMessage.version}: ${error.message}`)
        throw error
      }
    case 2:
      try {
        meta = await v2.process(context, pupilStatusMessage)
        for (const msg of pupilStatusMessage.messages) {
          context.bindings.pupilEventsTable.push({
            PartitionKey: msg.checkCode,
            RowKey: uuid(),
            eventType: 'pupil-status',
            payload: JSON.stringify(msg),
            processedAt: new Date()
          })
        }
        break
      } catch (error) {
        context.log.error(`pupil-status: ERROR: failed to process message version:${pupilStatusMessage.version}: ${error.message}`)
        throw error
      }
    default:
      throw new Error('pupil-status: unknown message version')
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`pupil-status: ${timeStamp} processed ${meta.processCount} checks, run took ${durationInMilliseconds} ms`)
}
