const { ServiceBusClient } = require("@azure/service-bus");
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

module.exports = async function (context, req) {
    context.log(`attempting to read poison queue at ${new Date().toISOString()}`)
    const queueName = 'message-replay-testing/$deadletterqueue'
    const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
    const queueClient = sbClient.createQueueClient(queueName);

    const messageCount = 10;

    try {
      for (let i = 0; i < messageCount; i++) {
        const messages = await queueClient.peek();
        if (!messages.length) {
          context.log("No more messages to peek");
          break;
        }
        context.log(`Peeking message #${i}: ${JSON.stringify(messages[0].body)}`);
      }
      await queueClient.close();
    }
    catch (error) {
      context.log.error(error)
    } finally {
      await sbClient.close();
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: 'finished'
    };
}
