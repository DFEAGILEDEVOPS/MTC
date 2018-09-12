'use strict'

const azureStorage = require('azure-storage')
const bluebird = require('bluebird')
const moment = require('moment')
const sqlService = require('less-tedious')
const uuid = require('uuid/v4')
const winston = require('winston')
const { TYPES } = require('tedious')

winston.level = 'error'
const config = require('../config')
sqlService.initialise(config)

const schema = '[mtc_admin]'
let azureTableService
initAzureTableService()

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

/**
 * Promisify the azureStorage library as it still lacks Promise support
 */
function initAzureTableService () {
  if (!azureTableService) {
    azureTableService = azureStorage.createTableService()
    bluebird.promisifyAll(azureTableService, {
      promisifier: (originalFunction) => function (...args) {
        return new Promise((resolve, reject) => {
          try {
            originalFunction.call(this, ...args, (error, result, response) => {
              if (error) {
                return reject(error)
              }
              resolve({ result, response })
            })
          } catch (error) {
            reject(error)
          }
        })
      }
    })
  }
}
