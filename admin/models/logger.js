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
      format,
      transports: [
        new winston.transports.Console({ level: this.level, silent: false, consoleWarnLevels: ['warn', 'error'] })
      ],
      meta: true,
      expressFormat: true,
      colorize: false
    }

    this.logger = winston.createLogger(baseLogOptions)

    if (config.Logging.SendToAppInsights === true) {
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

  log (level, msg, exception) {
    this.logger.log(level, msg + ' ', exception)
  }

  /**
   * AI -> critical
   * @param {string} msg
   */
  alert (msg, exception = null) { this.log('alert', msg, exception) }

  /**
   * AI -> error
   * @param {string} msg
   */
  error (msg, exception = null) { this.log('error', msg, exception) }

  /**
   * AI -> warning
   * @param {string} msg
   */
  warn (msg, exception = null) { this.log('warning', msg, exception) }

  /**
   * AI -> notice
   * @param {string} msg
   */
  info (msg, exception = null) { this.log('info', msg, exception) }

  /**
   * AI -> verbose
   * @param {string} msg
   */
  debug (msg, exception = null) { this.log('debug', msg, exception) }

  /**
   * @description 'pretty' prints an object with indentiation.
   * @param {object} obj
   */
  debugObject (obj) { this.log('debug', JSON.stringify(obj, null, 2)) }

  /**
   * Return the underlying `winston` logger
   * @return {winston.Logger | *}
   */
  getLogger () {
    return this.logger
  }
}

module.exports = Logger
