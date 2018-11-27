'use strict'

const v1 = require('./v1')
const validateMessage = require('./message-validator')

module.exports = async function (context, preparedCheckSyncMessage) {
  context.log(
    `prepared-check-sync: processing message version:${preparedCheckSyncMessage.version} for check:${preparedCheckSyncMessage.checkCode}`
  )

  validateMessage(preparedCheckSyncMessage)

  switch (preparedCheckSyncMessage.version) {
    case 1:
      try {
        await v1.process(context, preparedCheckSyncMessage)
        break
      } catch (error) {
        context.log.error(`prepared-check-sync: ERROR: failed to process message version:${preparedCheckSyncMessage.version} for ${preparedCheckSyncMessage.checkCode}`)
        throw error
      }
    default:
      throw new Error('Unknown message version')
  }
}
