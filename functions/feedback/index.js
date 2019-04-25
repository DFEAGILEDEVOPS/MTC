'use strict'

const uuid = require('uuid/v4')

function createEntityFromMessage (message) {
  return {
    PartitionKey: message.checkCode,
    RowKey: uuid(),
    checkCode: message.checkCode,
    inputType: message.inputType,
    satisfactionRating: message.satisfactionRating,
    comments: message.comments
  }
}

module.exports = async function (context, message) {
  context.bindings.data = []
  const entity = createEntityFromMessage(message)
  context.bindings.data.push(entity)
}
