const { QueueServiceClient } = require("@azure/storage-queue")

const service = {
  /**
   *
   * @param {string} storageAccountUrl
   * @param {string} queueName
   * @param {string} sasToken
   * @param {any} payload
   * @param {number} messageTtl
   * @returns {Promise<import('@azure/storage-queue').QueueSendMessageResponse>}
   */
  addMessageToQueue: async function addMessageToQueue (storageAccountUrl, queueName, sasToken,  payload, messageTtl = -1) {
    const queueServiceClient = new QueueServiceClient(`${storageAccountUrl}?${sasToken}`)
    const queueClient = queueServiceClient.getQueueClient(queueName)
    const options = {
      messageTimeToLive: messageTtl
    }
    // TODO: what about retry policy?
    return queueClient.sendMessage(payload, options)
  }
}

module.exports = service


