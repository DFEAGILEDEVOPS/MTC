'use strict'

const { QueueServiceClient, QueueSASPermissions } = require('@azure/storage-queue')
const config = require('../../config')

const service = {
  generateSasTokenWithPublishOnly: function (queueName, startDate, expiryDate) {
    const queueServiceClient = QueueServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const queueClient = queueServiceClient.getQueueClient(queueName)
    const permissions = new QueueSASPermissions()
    permissions.add = true
    return queueClient.generateSasUrl({
      permissions: permissions,
      startsOn: startDate,
      expiresOn: expiryDate
    })
  }
}

module.exports = service
