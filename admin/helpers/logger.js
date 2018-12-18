'use strict'

const config = require('../config')
const morgan = require('morgan')
const logger = require('../services/log.service').getLogger()

let initialised

const init = (app) => {
  if (initialised) return

  if (config.Logging.Express.UseWinston === 'true') {
    /**
     * Express logging to winston
     */
    const expressWinston = require('express-winston')
    app.use(expressWinston.logger({ winstonInstance: logger.getLogger() }))
  } else {
    app.use(morgan('dev'))
  }

  initialised = true
}

module.exports = init
