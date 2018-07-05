'use strict'

require('dotenv').config()
const config = require('./config')
const azureStorage = require('azure-storage')
const winston = require('winston')
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console()
  ]
})

const expRetryFilter = new azureStorage.ExponentialRetryPolicyFilter()
const qService = azureStorage.createQueueService().withFilter(expRetryFilter)
const qName = 'sastest'
let initialOperation = ''

qService.createQueueIfNotExists(qName, function (error, results, response) {
  if (!error) {
    if (results.created) {
      initialOperation = 'created'
    } else {
      initialOperation = 'connected to'
    }
    logger.info(`${initialOperation} ${qName} queue. Polling every ${config.pollInterval}ms`)
    try {
      bind()
    } catch (error) {
      logger.error(`error binding main worker function: ${error}`)
    }
  }
})

function bind () {
  setInterval(main.bind(null), config.pollInterval)
}

function main () {
  logger.info(`polling queue...`)
  qService.getMessages(qName, function (error, results, response) {
    if (!error) {
      if (results.length === 0) return
      results.forEach(result => {
        processMessage(result)
      })
    }
  })
}

function processMessage (message) {
  let content
  if (message.hasOwnProperty('messageText')) {
    content = Buffer.from(message.messageText, 'base64')
  } else {
    content = 'no text'
  }
  logger.info(`message collected: ${content}`)
  qService.deleteMessage(qName, message.messageId, message.popReceipt, function (error, response) {
    if (!error) {
      logger.info('message deleted successfully')
    } else {
      logger.error(`unable to delete message:${error}`)
    }
  })
}
