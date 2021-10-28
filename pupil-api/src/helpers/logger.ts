import config from '../config'
import logger from '../services/log.service'
'use strict'

const morgan = require('morgan')

let initialised: boolean

const init = (app: any) => {
  if (initialised) return

  if (config.Logging.Express.UseWinston === true) {
    /**
     * Express logging to winston
     */
    const expressWinston = require('express-winston')
    app.use(expressWinston.logger({ winstonInstance: logger }))
  } else {
    app.use(morgan('dev'))
  }

  initialised = true
}

module.exports = init
