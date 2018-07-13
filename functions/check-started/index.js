'use strict'

const uuid = require('uuid/v4')
const moment = require('moment')

module.exports = function (context, checkStartMessage) {
  context.log('check-started message received', checkStartMessage.checkCode)
  // TODO: purpose: process check start messages and put into pupilEvents table
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: checkStartMessage.checkCode,
    RowKey: uuid(),
    eventType: 'check-started',
    payload: JSON.stringify(checkStartMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)
  context.done()
}
