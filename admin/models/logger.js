const winston = require('winston')
const config = require('../config')

const loggingLevels = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}

class Logger {
  constructor () {
    this.level = config.Logging.LogLevel
    console.info('Log level is set to `%s`', this.level)

    let format
    if (config.Monitoring.ApplicationInsights.ConnectionString) {
      format = winston.format.json()
    } else {
      format = winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      )
    }

    const baseLogOptions = {
      levels: loggingLevels,
      level: this.level,
      format,
      transports: [
        new winston.transports.Console()
      ],
      meta: true,
      expressFormat: true,
      colorize: false
    }

    this.logger = winston.createLogger(baseLogOptions)
  }

  //  Private method
  #log (level, msg, exception = null) {
    let exString
    if (exception && exception.toString) {
      exString = `'${exception.toString()}'`
    }
    this.logger.log(level, exString ? msg.concat(': ', exString) : msg)
  }

  /**
   * AI -> critical
   * @param {string} msg
   */
  alert (msg, exception = null) { this.#log('alert', msg, exception) }

  /**
   * AI -> error
   * @param {string} msg
   */
  error (msg, exception = null) { this.#log('error', msg, exception) }

  /**
   * AI -> warning
   * @param {string} msg
   */
  warn (msg, exception = null) { this.#log('warning', msg, exception) }

  /**
   * AI -> notice
   * @param {string} msg
   */
  info (msg, exception = null) { this.#log('info', msg, exception) }

  /**
   * AI -> verbose
   * @param {string} msg
   */
  debug (msg, exception = null) { this.#log('debug', msg, exception) }

  /**
   * @description pretty prints an object.
   * @param {object} obj
   */
  debugObject (obj) { this.#log('debug', JSON.stringify(obj, null, 2)) }

  /**
   * Return the underlying `winston` logger
   * @return {winston.Logger | *}
   */
  getLogger () {
    return this.logger
  }
}

module.exports = Logger
