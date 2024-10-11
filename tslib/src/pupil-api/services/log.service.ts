import * as appInsights from 'applicationinsights'
import * as winston from 'winston'
import config from '../config'
import { isNotNil } from 'ramda'

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

const cloudRoleName = 'Pupil-API'

export type LogLevel = 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug'

export const startInsightsIfConfigured = (): void => {
  if (isNotNil(config.Logging.ApplicationInsights.ConnectionString)) {
    console.debug('initialising application insights module')

    appInsights.setup(config.Logging.ApplicationInsights.ConnectionString)
      .setAutoCollectRequests(true)
      // setAutoCollectPerformance() - for some reason this next call causes a configuration warning 'Extended metrics are no longer supported. ...'
      .setAutoCollectPerformance(true, false)
      .setAutoCollectExceptions(config.Logging.ApplicationInsights.CollectExceptions)
      .setAutoCollectDependencies(config.Logging.ApplicationInsights.CollectDependencies)
      .setAutoCollectConsole(config.Logging.LogLevel === 'debug')
      .setAutoCollectPreAggregatedMetrics(true)
      .setSendLiveMetrics(config.Logging.ApplicationInsights.LiveMetrics)
      .setInternalLogging(true, true)
      .enableWebInstrumentation(false)
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRoleName
    appInsights.start()
  }
}

startInsightsIfConfigured()

export class Logger {
  private readonly level: LogLevel
  private readonly logger

  constructor () {
    this.level = config.Logging.LogLevel

    const baseLogOptions = {
      levels: loggingLevels,
      level: this.level,
      format: winston.format.json(),
      transports: [
        new winston.transports.Console()
      ]
    }
    this.logger = winston.createLogger(baseLogOptions)
  }

  log (level: LogLevel, msg: string, exception?: any): void {
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
  info (msg: string, exception = null): void {
    this.log('info', msg, exception)
    // console.info(`console.log(): ${msg}`, exception ?? '')
    // if (appInsights.defaultClient !== undefined) {
    //   console.debug('making appinsights trace call')
    //   appInsights.defaultClient.trackTrace({ message: msg })
    //   console.debug('trace call complete')
    // }
  }

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
