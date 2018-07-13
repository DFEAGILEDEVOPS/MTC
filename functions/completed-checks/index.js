'use strict'

const uuid = require('uuid/v4')
const moment = require('moment')

module.exports = function (context, completedCheckMessage) {
  context.log('completed-check message received', completedCheckMessage.checkCode)
  // TODO: purpose: process completed-check messages and put into pupilEvents table
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: completedCheckMessage.checkCode,
    RowKey: uuid(),
    eventType: 'completed-check',
    payload: JSON.stringify(completedCheckMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)
  context.done()
}
