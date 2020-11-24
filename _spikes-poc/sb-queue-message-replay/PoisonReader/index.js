'use strict'

const { ServiceBusClient } = require('@azure/service-bus')
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING

module.exports = async function (context, req) {
  context.log(`attempting to read [${deadletterqueue}] at ${new Date().toISOString()}`)

  const queueName = 'message-replay-testing/$deadletterqueue'
  const sbClient = ServiceBusClient.createFromConnectionString(connectionString)
  const queueClient = sbClient.createQueueClient(queueName)

  const batchCount = 10
  const batchSize = 50
  let totalPeeked = 0

  try {
    for (let i = 0; i < batchCount; i++) {
      const messages = await queueClient.peek(batchSize)
      if (!messages.length) {
        context.log('No more messages to peek')
        break
      }
      totalPeeked += messages.length
      context.log(`${messages.length} in current batch`)
      context.log(`Peeking message #${i}: ${JSON.stringify(messages[0].body)}`)
    }
    await queueClient.close()
    context.log(`seen ${totalPeeked} messages in total`)
  }
  catch (error) {
    context.log.error(error)
  } finally {
    await sbClient.close()
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: 'finished'
  }
}
