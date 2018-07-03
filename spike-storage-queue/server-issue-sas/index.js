'use strict'

require('dotenv').config()
const azure = require('azure-storage')

const generateSasToken = () => {
  const storageConnection = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!storageConnection) {
    process.exitCode = -1
    console.error('env var $AZURE_STORAGE_CONNECTION_STRING is required')
  }

  const queueName = process.env.QUEUE_NAME || 'sastest'

  var queueService = azure.createQueueService(storageConnection)

  // Create a SAS token that expires in an hour
  // Set start time to five minutes ago to avoid clock skew.
  var startDate = new Date()
  startDate.setMinutes(startDate.getMinutes() - 5)
  var expiryDate = new Date(startDate)
  expiryDate.setMinutes(startDate.getMinutes() + 60)

  const permissions = azure.QueueUtilities.SharedAccessPermissions.ADD

  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: permissions,
      Start: startDate,
      Expiry: expiryDate
    }
  }

  var sasToken = queueService.generateSharedAccessSignature(queueName, sharedAccessPolicy)

  return {
    token: sasToken,
    uri: queueService.getUrl(queueName, sasToken, true)
  }
}

const response = generateSasToken()

console.dir(response)
