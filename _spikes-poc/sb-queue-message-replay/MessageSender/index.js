'use strict'

const { v4: uuidv4 } = require('uuid')

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.')

  const messageCount = (req.body && req.body.messageCount) || 5
  context.bindings.messageReplayTestingQueue = []

  for (let index = 0; index < messageCount; index++) {
    const msg = {
      mtcId: uuidv4(),
      createdAt: new Date().toISOString()
    }
    context.bindings.messageReplayTestingQueue.push(msg)
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: `${messageCount} messages were added to the queue`
  }
}
