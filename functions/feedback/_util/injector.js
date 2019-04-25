#!/usr/bin/env node

'use strict'

const path = require('path')
const uuid = require('uuid/v4')
const R = require('ramda')
const envLoc = path.resolve(__dirname, '../../.env')
require('dotenv').config({ path: envLoc })
const azureStorageHelper = require('../../lib/azure-storage-helper')

const feedbackQueue = 'pupil-feedback'
let totalMessagesSent = 0
let messagesToSend = 300000

function createMessage() {
  return {
    'version': '2',
    'checkCode': uuid(),
    'inputType': "Touchscreen",
    'satisfactionRating': "Easy",
    'comments': `Message comment`
  }
}

function generateMessageBatch(count) {
  return R.times(createMessage, count)
}

async function sendBatch (batchNumber) {
  const batch = generateMessageBatch(20)
  const promises = batch.map(msg => azureStorageHelper.addMessageToQueue(feedbackQueue, msg))

  try {
    await Promise.all(promises)
    console.log(`Batch ${batchNumber} sent`)
  } catch (error) {
    console.error(`Batch ${batchNumber} error: ${error.message}`)
  }

  totalMessagesSent += batch.length
}

async function inject () {
  let batchNumber = 1
  while (totalMessagesSent < messagesToSend) {
    await sendBatch(batchNumber++)
  }
}

// inject a bunch of messages to the feedback queue
inject()
  .then(res => console.log('All done'))
  .catch(error => console.error('Failed', error))
