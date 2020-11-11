const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus");
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

module.exports = async function (context, req) {

    const queueName = (req.query.name || (req.body && req.body.name));
    if (!queueName || queueName.length === 0) {
      context.res = {
        status: 400,
        body: 'name is required as query or body property'
      }
      return;
    }

    const deadLetterQueueName = `${queueName}/$deadletterqueue`
    const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
    const deadLetterQueueClient = sbClient.createQueueClient(deadLetterQueueName);
    const queueClient = sbClient.createQueueClient(queueName);

    const batchSize = 50;
    const deadLetterReceiver = deadLetterQueueClient.createReceiver(ReceiveMode.peekLock)
    const sender = queueClient.createSender()

    while(true) {
      const deadLetterMessages = await deadLetterReceiver.receiveMessages(batchSize)
      if (!deadLetterMessages.length) {
        context.log(`No more messages on queue ${deadLetterQueueName}`);
        break;
      }
      context.log(`received ${deadLetterMessages.length} messages from ${deadLetterQueueName}.`)
      await sender.sendBatch(deadLetterMessages.map(m => m.body))
      await Promise.all(deadLetterMessages.map(m => m.complete()))
    }

    await queueClient.close()
    await deadLetterQueueClient.close()
    await sbClient.close()
    await sender.close()
    await deadLetterReceiver.close()

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}
