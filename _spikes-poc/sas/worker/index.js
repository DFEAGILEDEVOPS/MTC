'use strict'

require('dotenv').config()
const config = require('./config')
const azureStorage = require('azure-storage')
const winston = require('winston')
const uuid = require('uuid/v4')
const moment = require('moment')

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

const expRetryFilter = new azureStorage.ExponentialRetryPolicyFilter()
const qService = azureStorage.createQueueService().withFilter(expRetryFilter)
const tableService = azureStorage.createTableService()
const tableName = 'completedchecks'
const qName = 'sastest'


const run = () => {
  setupStorage(poll)
}

setTimeout(run, 2000)

function setupStorage (callback) {
  let initialQueueOperation = ''

  qService.createQueueIfNotExists(qName, function (error, results, response) {
    if (!error) {
      if (results.created) {
        initialQueueOperation = 'created'
      } else {
        initialQueueOperation = 'connected to'
      }
      logger.info(`${initialQueueOperation} ${qName} queue.`)
      setupTableService(callback)
    }
  })
}

function setupTableService (callback) {
  let initialTableOperation = ''
  

  tableService.createTableIfNotExists(tableName, (error, result, response) => {
    if (!error) {
      if (result.created) {
        initialTableOperation = 'created'
      } else {
        initialTableOperation = 'connected to'
      }
      logger.info(`${initialTableOperation} table ${tableName}`)
      callback()
    } else {
      logger.error(error)
      callback(error)
    }
  })
}

function poll (error) {
  if (error) {
    process.exitCode = 1
    return
  }
  setInterval(main.bind(null), config.pollInterval)
}

function main () {
  qService.getMessages(qName, function (error, results, response) {
    if (!error) {
      if (results.length === 0) return
      logger.info(`collected ${results.length} messages.`)
      results.forEach(result => {
        processMessage(result)
      })
    }
  })
}

function processMessage (message) {
  if (!message) return
  if (message.messageText) {
    const content = Buffer.from(message.messageText, 'base64')
    let json = ''
    try {
      json = JSON.parse(content)
    } catch (error) {
      logger.error(error)
      return
    }
    const entGen = azureStorage.TableUtilities.entityGenerator
    const entity = {
      PartitionKey: entGen.String(json.pupil.checkCode),
      RowKey: entGen.String(uuid()),
      payload: entGen.String(JSON.stringify(json)),
      processedAt: entGen.DateTime(moment().toDate()),
      processedBy: entGen.String('hostname-env-processId (as we do for logDNA id on admin)')
    }
    tableService.insertEntity(tableName, entity, (error, result, response) => {
      if (!error) {
        logger.info(`message processed and added to table storage at ${moment().format()}`)
        qService.deleteMessage(qName, message.messageId, message.popReceipt, function (error, response) {
          if (error) {
            logger.error(`unable to delete message:${error}`)
          }
        })
      } else {
        logger.error(error)
      }
    })
  }
}
