'use strict'

require('dotenv').config()

const express = require('express')
const piping = require('piping')
const morgan = require('morgan')
const uuidV4 = require('uuid/v4')
const cors = require('cors')
const helmet = require('helmet')
const config = require('./config')
const devWhitelist = require('./whitelist-dev')
const azure = require('./azure')
const winston = require('winston')
const bodyParser = require('body-parser')

if (process.env.NODE_ENV !== 'production') {
  winston.level = 'debug'
}

azure.startInsightsIfConfigured()

const unsetVars = []
Object.keys(config).map((key) => {
  if (config[key] === undefined && !devWhitelist.includes(key)) {
    unsetVars.push(`${key}`)
  }
})

if (unsetVars.length > 0) {
  const error = `The following environment variables need to be defined:\n${unsetVars.join('\n')}`
  process.exitCode = 1
  throw new Error(error)
}

const index = require('./routes/index')

if (process.env.NODE_ENV === 'development') piping({ignore: [/test/, '/coverage/']})
const app = express()

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

/* Security Directives */

app.use(cors())
app.use(helmet())

// Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
const oneYearInSeconds = 31536000
app.use(helmet.hsts({
  maxAge: oneYearInSeconds,
  includeSubDomains: false,
  preload: false
}))

// azure uses req.headers['x-arr-ssl'] instead of x-forwarded-proto
// if production ensure x-forwarded-proto is https OR x-arr-ssl is present
app.use((req, res, next) => {
  if (azure.isAzure()) {
    app.enable('trust proxy')
    req.headers['x-forwarded-proto'] = req.header('x-arr-ssl') ? 'https' : 'http'
  }
  next()
})

// force HTTPS in azure
app.use((req, res, next) => {
  if (azure.isAzure()) {
    if (req.protocol !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    }
  } else {
    next()
  }
})

/* END:Security Directives */

app.use(bodyParser.json())

app.use('/', index)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  const errorId = uuidV4()
  // only providing error information in development
  // @TODO: change this to a real logger with an error string that contains
  // all pertinent information. Assume 2nd/3rd line support would pick this
  // up from logging web interface (e.g. ELK / LogDNA)
  winston.error('ERROR: ' + err.message + ' ID:' + errorId)
  winston.error(err.stack)

  // return the error as an JSON object
  err.message = err.message || 'An error occurred'
  err.errorId = errorId
  err.status = err.status || 500
  if (req.app.get('env') === 'development') {
    res.status(err.status).json({error: err.message, errorId: errorId})
  } else {
    res.status(err.status).json({error: 'An error occurred'})
  }
})

module.exports = app
