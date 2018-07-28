'use strict'

const azure = require('azure-storage')
const moment = require('moment')

require('dotenv').config()

const addPermissions = azure.QueueUtilities.SharedAccessPermissions.ADD
const storageConnection = process.env.AZURE_STORAGE_CONNECTION_STRING

if (!storageConnection) {
  throw new Error('An AZURE_STORAGE_CONNECTION_STRING is a required environment variable.')
}
const azureQueueService = azure.createQueueService(storageConnection)

const sasTokenService = {
  /**
   *
   * @param queueName
   * @param {Moment} expiryTime
   * @return {{token: string, url: string}}
   */
  generateSasToken: function (queueName, expiryDate, queueService = azureQueueService) {

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

    const sasToken = queueService.generateSharedAccessSignature(queueName, sharedAccessPolicy)

    return {
      token: sasToken,
      url: queueService.getUrl(queueName)
    }
  },

  /**
   * List of queue names used in MTC
   */
  queueNames: {
    PREPARE_CHECK: 'prepare-check',
    CHECK_COMPLETE: 'check-complete'
  }
}

module.exports = sasTokenService
