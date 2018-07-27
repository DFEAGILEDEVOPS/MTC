'use strict'

const config = require('../config')
const winston = require('winston')

/**
 * Optional environment variables
 */

const localDevWhitelist = [
  'GOOGLE_TRACKING_ID',
  'MTC_AUTH_PRIVATE_KEY',
  'NCA_TOOLS_AUTH_URL',
  'PUPIL_APP_URL',
  'RESTART_MAX_ATTEMPTS',
  'TSO_AUTH_PUBLIC_KEY',
  'OverridePinExpiry'
]

const main = (app) => {
  const whitelist = []
  if (process.env.NODE_ENV === 'development') {
    whitelist.push(localDevWhitelist)
  }
  console.log('checking vars')
  // block app if required vars not set and in development mode...
  const unsetVars = []
  Object.keys(config).map((key) => {
    if (config[key] === undefined && !whitelist.includes(key)) {
      unsetVars.push(`${key}`)
    }
  })
  console.log(`unsetVars:${unsetVars.length}`)
  if (unsetVars.length > 0) {
    const errorMessage = `The following environment variables need to be defined:\n${unsetVars.join('\n')}`
    winston.error(errorMessage)
    app.use(function (req, res, next) {
      let err = new Error(errorMessage)
      err.status = 500
      next(err)
    })
  }
}

module.exports = main
