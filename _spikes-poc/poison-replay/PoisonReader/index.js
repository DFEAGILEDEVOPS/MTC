const { ServiceBusClient } = require("@azure/service-bus");
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

module.exports = async function (context, req) {

    const nameParam = (req.query.name || (req.body && req.body.name));
    const messageCount = 50

    if (!nameParam) {
      throw new Error('name parameter is required for queueName to read')
    }

    const queueName = `${nameParam}/$deadletterqueue`
    const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
    // If using Topics & Subscription, use createSubscriptionClient to peek from the subscription
    const queueClient = sbClient.createQueueClient(queueName);

    try {
      for (let i = 0; i < messageCount; i++) {
        const messages = await queueClient.peek();
        if (!messages.length) {
          console.log("No more messages to peek");
          break;
        }
        console.log(`Peeking message #${i}: ${messages[0].body}`);
      }
      await queueClient.close();
    } finally {
      await sbClient.close();
    }



    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}
