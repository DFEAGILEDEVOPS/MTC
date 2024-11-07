import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const { QueueServiceClient } = require("@azure/storage-queue")

const daysUntilExpiryInSeconds = 2419200
const messageBatchSize = 32

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const queueServiceClient = QueueServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
  const queueClient = queueServiceClient.getQueueClient('check-submitted-poison')

  let response = await queueClient.receiveMessages({
    numberOfMessages: messageBatchSize
  })
  let messageCount = response.receivedMessageItems.length

  while (messageCount > 0) {
    const promises = []
    for (let i = 0; i < messageCount; i++) {
      const message = response.receivedMessageItems[i]
      // updateMessage fails as API supports max 7 days (604800 seconds)
      promises.push(queueClient.updateMessage(message.messageId, message.popReceipt, undefined,
        daysUntilExpiryInSeconds))
    }
    await Promise.all(promises)
    response = await queueClient.receiveMessages({
      numberOfMessages: messageBatchSize
    })
    messageCount = response.receivedMessageItems.length
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: 'ttl values updated'
  }

}

export default httpTrigger
