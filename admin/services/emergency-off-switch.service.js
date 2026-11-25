'use strict'

const emergencyOffSwitchDataService = require('./data-access/emergency-off-switch.data.service')

const emergencyOffSwitchService = {}

emergencyOffSwitchService.get = async () => {
  const state = await emergencyOffSwitchDataService.sqlFindOne()
  if (!state) {
    throw new Error('Emergency off-switch state has not been initialized')
  }
  return state
}

emergencyOffSwitchService.update = async (isEnabled, userId) => {
  if (typeof isEnabled !== 'boolean') {
    throw new TypeError('Emergency off-switch state must be a boolean')
  }
  if (!Number.isInteger(userId)) {
    throw new TypeError('A valid user ID is required to update the emergency off-switch')
  }
  return emergencyOffSwitchDataService.sqlUpdate(isEnabled, userId)
}

module.exports = emergencyOffSwitchService
