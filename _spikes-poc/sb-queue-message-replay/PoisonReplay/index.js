'use strict'

const { ServiceBusClient, ReceiveMode } = require('@azure/service-bus')
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING

module.exports = async function (context, req) {
  const queueName = (req.query.name || (req.body && req.body.name))
  if (!queueName || queueName.length === 0) {
    context.res = {
      status: 400,
      body: 'name is required as query or body property'
    }
    return
  }

  const deadLetterQueueName = `${queueName}/$deadletterqueue`
  const sbClient = ServiceBusClient.createFromConnectionString(connectionString)
  const deadLetterQueueClient = sbClient.createQueueClient(deadLetterQueueName)
  const queueClient = sbClient.createQueueClient(queueName)

  const batchSize = 50
  const deadLetterReceiver = deadLetterQueueClient.createReceiver(ReceiveMode.peekLock)
  const sender = queueClient.createSender()

  try {
    while (true) {
      const deadLetterMessages = await deadLetterReceiver.receiveMessages(batchSize)
      if (!deadLetterMessages.length) {
        context.log(`No more messages on queue ${deadLetterQueueName}`)
        break
      }
      context.log(`received ${deadLetterMessages.length} messages from ${deadLetterQueueName}.`)
      const newMessages = []
      for (let index = 0; index < deadLetterMessages.length; index++) {
        const message = deadLetterMessages[index]
        newMessages.push({
          body: message.body
        })
      }
      await sender.sendBatch(newMessages)
      context.log(`batch of ${newMessages.length} messages replayed from dead letter queue`)
      context.log('completing messages...')
      for (let index = 0; index < deadLetterMessages.length; index++) {
        const msg = deadLetterMessages[index]
        await msg.complete()
      }
      context.log('done')
    }
  } catch (error) {
    context.log.error(error)
    context.res = {
      status: 500,
      body: `error occured:${error.message}`
    }
  } finally {
    await sender.close()
    await deadLetterReceiver.close()
    await queueClient.close()
    await deadLetterQueueClient.close()
    await sbClient.close()
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: 'done'
  }
}
