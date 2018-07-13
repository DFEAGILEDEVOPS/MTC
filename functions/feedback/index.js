'use strict'

const uuid = require('uuid/v4')
const moment = require('moment')

module.exports = function (context, feedbackMessage) {
  context.log('feedback message received', feedbackMessage)
  // TODO: purpose: process feedback messages and put into pupilEvents table
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: feedbackMessage.checkCode,
    RowKey: uuid(),
    eventType: 'feedback',
    payload: JSON.stringify(feedbackMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)
  context.done()
}
