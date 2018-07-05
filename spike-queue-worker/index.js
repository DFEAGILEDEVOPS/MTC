'use strict'

require('dotenv').config()
const config = require('./config')
const azureStorage = require('azure-storage')
const winston = require('winston')

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
    winston.info(`${initialOperation} ${qName} queue. Polling every ${config.pollInterval}ms`)
    try {
      bind()
    } catch (error) {
      winston.error(`error binding main worker function: ${error}`)
    }
  }
})

function bind () {
  setInterval(main.bind(null), config.pollInterval)
}

function main () {
  winston.info(`polling queue...`)
  qService.getMessages(qName, function (error, results, response) {
    if (!error) {
      // Message text is in results[0].messageText
      const message = results[0]
      let messageText
      if (message.messageText) {
        messageText = Buffer.from(messageText, 'base64')
      } else {
        messageText = 'no text'
      }
      winston.info(`message collected: ${messageText}`)
      qService.deleteMessage(qName, message.messageId, message.popReceipt, function (error, response) {
        if (!error) {
          winston.info('message deleted successfully')
        } else {
          winston.error(`unable to delete message:${error}`)
        }
      })
    }
  })
}
