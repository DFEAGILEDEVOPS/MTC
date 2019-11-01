'use strict'

const pupilStatusService = require('./pupil-status.service')

async function process (context, pupilStatusMessage) {
  if (!Object.prototype.hasOwnProperty.call(pupilStatusMessage, 'pupilId')) {
    throw new Error('pupil-status: Invalid message. Missing pupilId.')
  }

  if (!Object.prototype.hasOwnProperty.call(pupilStatusMessage, 'checkCode')) {
    throw new Error('pupil-status: Invalid message. Missing checkCode.')
  }

  try {
    await pupilStatusService.recalculatePupilStatus(pupilStatusMessage.pupilId)
  } catch (error) {
    context.log.error(`pupil-status: Failed to recalculate pupil status for pupil ${pupilStatusMessage.pupilId}`)
    throw error
  }

  return {
    processCount: 1
  }
}

module.exports = { process }
