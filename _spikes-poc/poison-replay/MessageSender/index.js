const uuid = require('uuid/v4')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const messageCount = req.body.messageCount || 50
    context.bindings.messageReplayTestingQueue = []

    for (let index = 0; index < messageCount; index++) {
      const msg = {
        mtcId: uuid(),
        createdAt: new Date().toISOString()
      }
      context.bindings.messageReplayTestingQueue.push(msg)
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: `${messageCount} messages were added to the queue`
    };
}
