'use strict'

const v1 = require('./v1')
const validateMessage = require('./message-validator')

module.exports = async function (context, pupilPrefsMessage) {
  context.log(
    `pupil-prefs: processing message version:${pupilPrefsMessage.version} for check:${pupilPrefsMessage.checkCode}`
  )
  validateMessage(pupilPrefsMessage)
  switch (pupilPrefsMessage.version) {
    case 1:
      try {
        await v1.process(context, pupilPrefsMessage)
        break
      } catch (error) {
        context.log.error(`prepared-check-sync: ERROR: failed to process message version:${pupilPrefsMessage.version} for ${pupilPrefsMessage.checkCode}`)
        throw error
      }
    default:
      throw new Error('Unknown message version')
  }
}
