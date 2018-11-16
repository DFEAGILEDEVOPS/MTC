'use strict'

const uuid = require('uuid/v4')
const { performance } = require('perf_hooks');

const v1 = require('./v1')

module.exports = async function (context, message) {
  const start = performance.now()
  if (typeof message !== 'object') {
    throw new Error('check-expiry: badly formed message')
  }

  context.log('check-expiry message received', message.checkCode)

  try {
    v1.process(message, context.log)
  } catch (error) {
    context.log.error(`check-expiry: Failed to expire check ${message.checkCode}: ${error.message}`)
    throw error
  }

  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: message.checkCode,
    RowKey: uuid(),
    eventType: 'check-expiry',
    payload: JSON.stringify(message),
    processedAt: new Date()
  }
  context.bindings.pupilEventsTable.push(entity)
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`check-expiry: ${timeStamp} run complete: expired 1 check in ${durationInMilliseconds} ms`)
}