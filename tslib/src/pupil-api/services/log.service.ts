import * as winston from 'winston'
import config from '../config'
import { AzureApplicationInsightsLogger } from 'winston-azure-application-insights'
import * as appInsights from 'applicationinsights'

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

export class Logger {
  private readonly level: string
  private readonly logger

  constructor () {
    this.level = config.Logging.LogLevel

    let format
    if (config.Logging.ApplicationInsights.LogToWinston === true) {
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

    if (config.Logging.ApplicationInsights.LogToWinston === true) {
      console.log('app insights config enabled')
      appInsights.setup(config.Logging.ApplicationInsights.Key).start()

      this.logger
        .clear() // remove all transports
        .add(new AzureApplicationInsightsLogger({
          insights: appInsights,
          sendErrorsAsExceptions: true,
          level: this.level
        }))
    }
  }

  log (level: string, msg: string, exception?: any): void {
    this.logger.log(level, msg, exception)
  }

  /**
   * AI -> critical
   * @param {string} msg
   */
  alert (msg: string, exception = null): void { this.log('alert', msg, exception) }

  /**
   * AI -> error
   * @param {string} msg
   */
  error (msg: string, exception = null): void { this.log('error', msg, exception) }

  /**
   * AI -> warning
   * @param {string} msg
   */
  warn (msg: string, exception = null): void { this.log('warning', msg, exception) }

  /**
   * AI -> notice
   * @param {string} msg
   */
  info (msg: string, exception = null): void { this.log('info', msg, exception) }

  /**
   * AI -> verbose
   * @param {string} msg
   */
  debug (msg: string, exception = null): void { this.log('debug', msg, exception) }

  /**
   * Return the underlying `winston` logger
   * @return {winston.Logger | *}
   */
  getLogger (): winston.Logger {
    return this.logger
  }
}

export default new Logger()
