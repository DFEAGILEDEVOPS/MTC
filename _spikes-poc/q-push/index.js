'use strict'

require('dotenv').config()
const azure = require('azure-storage')
const config = require('./config')
const completePayload = require('./sample-payloads/complete-check')
const uuid = require('uuid/v4')

if (!config.StorageConnection) {
  process.exitCode = -1
  console.error('env var $AZURE_STORAGE_CONNECTION_STRING is required')
}

const checkq = 'check-started'
const completeq = 'completed-checks'
const feedbackq = 'pupil-feedback'
const prefsq = 'pupil-preferences'
const allqs = [checkq, completeq, feedbackq, prefsq]

const qsvc = azure.createQueueService(config.storageConnection)
console.log(`adding ${config.MessageCount} messages to each queue`)

for (let index = 0; index < config.MessageCount; index++) {
  addCheckStartedMessage()
  addCheckCompleteMessage()
  addFeedbackMessage()
  addPreferencesMessage()
}

function initQueues () {
  allqs.forEach((queueName) => {
    qsvc.createQueueIfNotExists(queueName, function (error, results, response) {
      if (error) {
        throw new Error(`error creating queue ${queueName}: ${error}`)
      }
    })
  })
}

function submit (message, queueName) {
  qsvc.createMessage(queueName, message, function (error, results, response) {
    if (!error) {
      console.log(`message added to ${queueName} successfully`)
    } else {
      console.error(`error adding message to ${queueName} queue: ${error}`)
    }
  })
}

function addCheckCompleteMessage () {
  const clonePayload = { ...completePayload }
  clonePayload.pupil.checkCode = uuid()
  const encodedMessage = Buffer.from(JSON.stringify(clonePayload)).toString('base64')
  submit(encodedMessage, completeq)
}
function addCheckStartedMessage () {}
function addFeedbackMessage () {}
function addPreferencesMessage () {}
