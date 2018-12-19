'use strict'

const pupilStatusBatchService = require('./pupil-status-batch.service')

function validate (message) {
  if (!Array.isArray(message.messages)) {
    throw new Error('pupil-status: invalid version:2 message.  `messages` should be an Array.')
  }
  message.messages.forEach(msg => {
    if (!msg.pupilId) {
      throw new Error('pupil-status: `pupilId` is missing')
    }
    if (!msg.checkCode) {
      throw new Error('pupil-status: `checkCode` is missing')
    }
  })
}

async function process (context, message) {
  validate(message)

  try {
    const pupilIds = message.messages.map(o => o.pupilId)
    await pupilStatusBatchService.recalculatePupilStatus(context, pupilIds)
  } catch (error) {
    context.log.error(`pupil-status: Failed to recalculate pupil status: ${error.message}`)
    throw error
  }

  return {
    processCount: message.messages.length
  }
}

module.exports = { process }
