'use strict'

const pupilStatusService = require('./pupil-status.service')

async function process (context, pupilStatusMessage) {
  if (!pupilStatusMessage.hasOwnProperty('pupilId')) {
    throw new Error('pupil-status: Invalid message. Missing pupilId.')
  }

  if (!pupilStatusMessage.hasOwnProperty('checkCode')) {
    throw new Error('pupil-status: Invalid message. Missing checkCode.')
  }

  try {
    await pupilStatusService.recalculatePupilStatus(pupilStatusMessage.pupilId, context)
  } catch (error) {
    context.log.error(`pupil-status: Failed to recalculate pupil status for pupil ${pupilStatusMessage.pupilId}`)
    throw error
  }

  return {
    processCount: 1
  }
}

module.exports = { process }
