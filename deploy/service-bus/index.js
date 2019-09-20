'use strict'

const azure = require('azure')
const sbService = azure.createServiceBusService()
const util = require('util')

const defaultQueueOptions = {
  MaxSizeInMegabytes: '5120',
  DefaultMessageTimeToLive: ''
}

const createQueue = (queueName, queueOptions) => {
  const promise = util.promisify(sbService.createQueueIfNotExists('myqueue', queueOptions, function (error) {
    if (!error) {
      // Queue exists
    }
  }))
  return promise
}
