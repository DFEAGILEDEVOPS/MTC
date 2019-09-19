'use strict'

const R = require('ramda')
const report = require('./report')

/**
 * Report if the device had a low battery during the check
 * @param data
 */
const detectLowBattery = function detectLowBattery (data) {
  const battery = R.path(['checkPayload', 'device', 'battery'], data)
  if (!battery) { return }
  if (battery.levelPercent < 20 && !battery.isCharging) {
    return report(data, 'Low battery', `${battery.levelPercent}% charging ${battery.isCharging}`, '> 20%')
  }
}

module.exports = detectLowBattery
