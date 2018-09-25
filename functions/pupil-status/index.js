'use strict'

const moment = require('moment')
const sqlService = require('less-tedious')
const uuid = require('uuid/v4')
const winston = require('winston')
const { TYPES } = require('tedious')
const { getPromisifiedAzureTableService } = require('../lib/azure-storage-helper')

winston.level = 'error'
const config = require('../config')
sqlService.initialise(config)

const schema = '[mtc_admin]'
const azureTableService = getPromisifiedAzureTableService()

module.exports = async function (context, pupilStatusMessage) {
  context.log('pupil-status message received')

  // TODO process pupil status

  // Store the raw message to an audit log
  context.bindings.pupilEventsTable = []
  const entity = {
    // TODO will we always have a check code?
    PartitionKey: pupilStatusMessage.checkCode,
    RowKey: uuid(),
    eventType: 'pupil-status',
    payload: JSON.stringify(pupilStatusMessage),
    processedAt: moment().toDate()
  }

  context.bindings.pupilEventsTable.push(entity)
}
