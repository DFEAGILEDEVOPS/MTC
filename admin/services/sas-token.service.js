'use strict'

const azure = require('azure-storage')
const moment = require('moment')
const winston = require('winston')
const config = require('../config')

const addPermissions = azure.QueueUtilities.SharedAccessPermissions.ADD
let azureQueueService

const sasTokenService = {
  /**
   *
   * @param queueName
   * @param {Moment} expiryTime
   * @param {Object} serviceImplementation
   * @return {{token: string, url: string}}
   */
  generateSasToken: function (queueName, expiryDate, serviceImplementation) {
    if (!serviceImplementation) {
      if (!azureQueueService) {
        if (!config.AZURE_STORAGE_CONNECTION_STRING) {
          throw new Error('An AZURE_STORAGE_CONNECTION_STRING is a required environment variable.')
        }
        // init the queue service the first time this is called
        azureQueueService = azure.createQueueService(config.AZURE_STORAGE_CONNECTION_STRING)
      }
      serviceImplementation = azureQueueService
    }

    if (!moment.isMoment(expiryDate) || !expiryDate.isValid()) {
      throw new Error('Invalid expiryDate')
    }

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    const startDate = new Date()
    startDate.setMinutes(startDate.getMinutes() - 5)

    const sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: addPermissions,
        Start: startDate,
        Expiry: expiryDate.toDate()
      }
    }

    winston.debug('Generating SAS token for Queue: ' + queueName)

    const sasToken = serviceImplementation.generateSharedAccessSignature(queueName, sharedAccessPolicy)

    return {
      token: sasToken,
      url: serviceImplementation.getUrl(queueName)
    }
  }
}

module.exports = sasTokenService
