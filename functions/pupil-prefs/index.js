'use strict'

const uuid = require('uuid/v4')
const moment = require('moment')

module.exports = function (context, prefsMessage) {
  context.log('pupil-preferences message received', prefsMessage)
  // TODO: purpose: process pupil preferences messages and put into pupilEvents table
  context.bindings.pupilEventsTable = []
  const entity = {
    PartitionKey: prefsMessage.checkCode,
    RowKey: uuid(),
    eventType: 'pupil-preferences',
    payload: JSON.stringify(prefsMessage),
    processedAt: moment().toDate()
  }
  context.bindings.pupilEventsTable.push(entity)
  context.done()
}
