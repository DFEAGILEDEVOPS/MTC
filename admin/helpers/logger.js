'use strict'

const winston = require('winston')
const config = require('../config')
const morgan = require('morgan')

let initialised

const init = (app) => {
  if (initialised) return
  /**
 * Logging
 * use LogDNA transport for winston if configuration setting available
 */
/*   if (config.Logging.LogDna.key) {
    require('logdna')
    const options = config.Logging.LogDna
    // Defaults to false, when true ensures meta object will be searchable
    options.index_meta = true
    // Only add this line in order to track exceptions
    options.handleExceptions = true
    winston.add(winston.transports.Logdna, options)
    winston.info(`logdna transport enabled for ${options.hostname}`)
  } */

  winston.level = config.Logging.LogLevel

  if (config.Logging.Express.UseWinston === 'true') {
    /**
     * Express logging to winston
     */
    const expressWinston = require('express-winston')
    app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ],
      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      // msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      ignoreRoute: function (req, res) {
        return false
      } // optional: allows to skip some log messages based on request and/or response
    }))
  } else {
    app.use(morgan('dev'))
  }

  if (config.Logging.ApplicationInsights.LogToWinston) {
    const aiLogger = require('winston-azure-application-insights').AzureApplicationInsightsLogger

    winston.add(aiLogger, {
      key: config.Logging.ApplicationInsights.Key,
      treatErrorsAsExceptions: true
    })
    winston.info(`app insights winston transport enabled`)
  }
  initialised = true
}

module.exports = init
