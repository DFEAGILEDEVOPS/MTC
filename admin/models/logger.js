const winston = require('winston')
const config = require('../config')

/*
const syslogLevels = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}
*/

class Logger {
  constructor () {
    this.level = config.Logging.LogLevel

    let format
    if (config.Logging.SendToAppInsights) {
      format = winston.format.simple()
    } else {
      format = winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      )
    }

    const baseLogOptions = {
      levels: winston.config.syslog.levels,
      level: this.level,
      format: format,
      transports: [
        new winston.transports.Console({ level: this.level, silent: false, consoleWarnLevels: ['warn', 'error'] })
      ],
      meta: true,
      expressFormat: true,
      colorize: false
    }

    this.logger = winston.createLogger(baseLogOptions)

    if (config.Logging.SendToAppInsights) {
      console.log('app insights config enabled')
      const { AzureApplicationInsightsLogger } = require('winston-azure-application-insights')
      const appInsights = require('applicationinsights')

      appInsights.setup(config.Monitoring.ApplicationInsights.Key).start()

      this.logger
        .clear() // remove all transports
        .add(new AzureApplicationInsightsLogger({
          insights: appInsights,
          sendErrorsAsExceptions: true,
          level: this.level
        }))
    }
  }

  log (level, msg, meta) {
    if (meta instanceof Error) {
      /*
        winston concats any `message` properties in the
        provided `meta` object, to the original `msg`.
        Prevent this happening when `meta` is an Error,
        which has a `message` property.
      */
      let error = {}
      Object.getOwnPropertyNames(meta).forEach(prop => {
        error[prop] = meta[prop]
      })
      meta = { error }
    }
    this.logger.log(level, msg, meta)
  }

  /**
   * AI -> critical
   * @param {string} msg
   */
  alert (msg, meta = null) { this.log('alert', msg, meta) }

  /**
   * AI -> error
   * @param {string} msg
   */
  error (msg, meta = null) { this.log('error', msg, meta) }

  /**
   * AI -> warning
   * @param {string} msg
   */
  warn (msg, meta = null) { this.log('warning', msg, meta) }

  /**
   * AI -> notice
   * @param {string} msg
   */
  info (msg, meta = null) { this.log('info', msg, meta) }

  /**
   * AI -> verbose
   * @param {string} msg
   */
  debug (msg, meta = null) { this.log('debug', msg, meta) }

  /**
   * Return the underlying `winston` logger
   * @return {winston.Logger | *}
   */
  getLogger () {
    return this.logger
  }
}

module.exports = Logger
