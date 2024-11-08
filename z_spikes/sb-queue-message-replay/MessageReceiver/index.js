'use strict'

const { ServiceBusClient, ReceiveMode } = require('@azure/service-bus')
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING

module.exports = async function (context, req) {
  const autoFail = req.query.fail || false
  let receiveMode = ReceiveMode.receiveAndDelete

  if (autoFail) {
    receiveMode = ReceiveMode.peekLock
  }

  context.log(`autoFail:${autoFail} receiveMode:${receiveMode.toString()}`)

  const queueName = autoFail ? 'message-replay-testing' : 'message-replay-testing/$deadletterqueue'
  const sbClient = ServiceBusClient.createFromConnectionString(connectionString)
  const queueClient = sbClient.createQueueClient(queueName)
  const receiver = queueClient.createReceiver(receiveMode)
  const batchCount = 10
  const batchSize = 50
  let totalReceived = 0

  try {
    for (let i = 0; i < batchCount; i++) {
      const messages = await receiver.receiveMessages(batchSize)
      if (!messages.length) {
        context.log('No more messages to receive')
        break
      }
      totalReceived += messages.length
      context.log(`${messages.length} in current batch`)
      if (autoFail) {
        for (let index = 0; index < messages.length; index++) {
          const msg = messages[index]
          await msg.abandon()
        }
      }
    }
    await queueClient.close()
    context.log(`seen ${totalReceived} messages in total`)
  } catch (error) {
    context.log.error(error)
  } finally {
    await receiver.close()
    await queueClient.close()
    await sbClient.close()
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: 'finished'
  }
}
