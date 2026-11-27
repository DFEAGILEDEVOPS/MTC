'use strict'

const emergencyOffSwitchService = require('../services/emergency-off-switch.service')
const logger = require('../services/log.service').getLogger()

module.exports = async function getPupilServiceAvailability (req, res) {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  })

  try {
    const state = await emergencyOffSwitchService.get()
    if (typeof state.isEnabled !== 'boolean') {
      throw new Error('Emergency off-switch state is invalid')
    }
    return res.json({ isEnabled: state.isEnabled })
  } catch (error) {
    logger.error('Failed to check pupil service availability', error)
    return res.status(503).json({ error: 'Unable to check service availability' })
  }
}
