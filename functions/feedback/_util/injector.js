#!/usr/bin/env node

'use strict'

const path = require('path')
const envLoc = path.resolve(__dirname, '../../.env')
require('dotenv').config({ path: envLoc })
const azureStorageHelper = require('../../lib/azure-storage-helper')

const feedbackQueue = 'pupil-feedback'

async function inject(numberOfMessages) {
  for (let i = 1; i <= numberOfMessages; i++) {
    try {
      const msg = {
        "version": "1",
        "checkCode": "B6213E44-EC68-4ADC-ACB7-F8F19AC4F150",
        "inputType": 1,
        "satisfactionRating": 5,
        "comments": `Message ${i}`
      }
      await azureStorageHelper.addMessageToQueue(feedbackQueue, msg)
    } catch (error) {
      console.error(error)
    }
  }
}


// inject a bunch of messages to the feedback queue
inject(100)
.then(res => console.log('All done'))
.catch(err => console.error('Failed', error))
