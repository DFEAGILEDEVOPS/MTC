'use strict'

const os = require('os')
const config = require('./config')
const winston = require('winston')
const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

const winstonLogger = {}

/**
 * Winston + LogDNA logger.
 * @param options
 * @returns {*}
 */
winstonLogger.logger = (options) => {
  require('logdna')
  if (!options || !options.key) { return false }
  return new winston.Logger({
    transports: [
      new winston.transports.File({
        level: 'info',
        filename: '/logs/' + options.app && (options.app.length > 0 ? options.app + '-' : '') + 'activity.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 10,
        colorize: false
      }),
      new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
      }),
      new winston.transports.Logdna({
        key: options.key,
        hostname: options.hostname || `${os.hostname()}:${process.pid}`,
        ip: undefined,
        mac: undefined,
        app: options.app || `MTC-:${getEnvironment()}`
      })
    ],
    exitOnError: false
  })
}

/**
 * Admin logger.
 * @returns {*}
 */
// winstonLogger.adminLogger = () => {
//   return winstonLogger.logger({
//     app: `MTC-ADMIN-${process.env.ENVIRONMENT_NAME || 'Local-Dev'}`,
//     hostname: `${os.hostname()}:${process.pid}`,
//     key: config.Logging.LogDna.key
//   })
// }

/**
 * API logger.
 * @returns {*}
 */
winstonLogger.apiLogger = () => {
  return winstonLogger.logger({
    app: `MTC-API-${process.env.ENVIRONMENT_NAME || 'Local-Dev'}`,
    hostname: `${os.hostname()}:${process.pid}`,
    key: config.Logging.LogDna.key
  })
}

module.exports = winstonLogger
