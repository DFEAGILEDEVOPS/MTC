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

const startq = 'check-started'
const completeq = 'completed-checks'
const feedbackq = 'pupil-feedback'
const prefsq = 'pupil-preferences'
const allqs = [startq, completeq, feedbackq, prefsq]

const qsvc = azure.createQueueService(config.storageConnection)
console.log(`adding ${config.MessageCount} messages to each queue`)

for (let index = 0; index < config.MessageCount; index++) {
  const checkCode = uuid()
  addPreferencesMessage(checkCode)
  addCheckStartedMessage(checkCode)
  addCheckCompleteMessage(checkCode)
  addFeedbackMessage(checkCode)
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
  const encodedMessage = Buffer.from(JSON.stringify(message)).toString('base64')
  qsvc.createMessage(queueName, encodedMessage, function (error, results, response) {
    if (!error) {
      console.log(`message added to ${queueName} successfully`)
    } else {
      console.error(`error adding message to ${queueName} queue: ${error}`)
    }
  })
}

function addCheckCompleteMessage (checkCode) {
  const clonePayload = { ...completePayload }
  clonePayload.checkCode = checkCode
  delete clonePayload.pupil
  submit(clonePayload, completeq)
}

function addCheckStartedMessage (checkCode) {
  const payload = {
    checkCode: checkCode,
    jwt: 'token-content'
  }
  submit(payload, startq)
}
function addFeedbackMessage (checkCode) {
  const payload = {
    rating: Math.floor(Math.random() * Math.floor(5)),
    comments: 'pupil comments',
    checkCode: checkCode
  }
  submit(payload, feedbackq)
}
function addPreferencesMessage (checkCode) {
  const payload = {
    checkCode: checkCode,
    zoomLevel: 2,
    type: 'Monaco',
    colorInvert: true
  }
  submit(payload, prefsq)
}
