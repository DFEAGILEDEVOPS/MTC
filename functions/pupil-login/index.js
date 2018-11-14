'use strict'

const v1 = require('./v1')
const validateMessage = require('./message-validator')

module.exports = async function (context, message) {
  context.log(
    `processing pupil-login message version:${message.version} for check:${message.checkCode}`
  )

  validateMessage(message)

  switch (message.version) {
    case 1:
      try {
        await v1.process(message.checkCode, message.loginAt)
        break
      } catch (error) {
        context.log.error(`pupil-login: ERROR: failed to process message version:${message.version} for ${message.checkCode}`)
        throw error
      }
    default:
      throw new Error('Unknown message version')
  }
}
