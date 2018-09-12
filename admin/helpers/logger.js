'use strict'

const winston = require('winston')
const config = require('../config')
const morgan = require('morgan')

let initialised

const init = (app) => {
  if (initialised) return

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
