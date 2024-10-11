import express from 'express'
import * as bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import { v4 as uuidv4 } from 'uuid'
import logger from './services/log.service'
import authRoutes from './routes/auth'
import submitRoutes from './routes/submit'
import pingRoute from './routes/ping'
import headRoute from './routes/head'
import * as corsOptions from './helpers/cors-options'
import { initLogger } from './helpers/logger'
import { JwtSecretValidator } from '../services/jwt-secret.validator'
import config from '../config'

// Creates and configures an ExpressJS web server.
class App {
  // ref to Express instance
  public express: express.Application

  // Run configuration methods on the Express instance.
  constructor () {
    this.express = express()
    this.middleware()
    this.routes()
    JwtSecretValidator.validate(config.PupilApi.JwtSecret)
  }

  // Configure Express middleware.
  private middleware (): void {
    /* Logging */

    initLogger(this.express)

    /* Security Directives */

    this.express.use(cors(corsOptions))
    this.express.use(helmet())

    // Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
    const oneYearInSeconds = 31536000
    this.express.use(helmet.hsts({
      maxAge: oneYearInSeconds,
      includeSubDomains: true,
      preload: true
    }))
    // Prod / Service-Bus / check-submission has a max message size of 1MB
    // Local / Service-Bus (non-premium) will have a limit of 250KB
    this.express.use(bodyParser.json({ limit: '1MB' }))
  }

  // Configure API endpoints.
  private routes (): void {
    /* API endpoints */
    this.express.use('/ping', pingRoute)
    this.express.use('/auth', authRoutes)
    this.express.use('/submit', submitRoutes)
    this.express.use(headRoute)

    // catch 404 and forward to error handler
    this.express.use(function (req, res, next) {
      const err: any = new Error('Not Found')
      err.status = 404
      next(err)
    })

    // error handler
    this.express.use(function (err: any, req: any, res: any, next: any) {
      const errorId = uuidv4()
      // only providing error information in development
      // @TODO: change this to a real logger with an error string that contains
      // all pertinent information. Assume 2nd/3rd line support would pick this
      // up from logging web interface (e.g. ELK / LogDNA)
      logger.error(`ERROR: ${err.message} ID: ${errorId}`, err)

      // return the error as an JSON object
      err.message = err.message ?? 'An error occurred'
      err.errorId = errorId
      err.status = err.status ?? 500
      if (req.app.get('env') === 'development') {
        res.status(err.status).json({ error: err.message, errorId })
      } else {
        res.status(err.status).json({ error: 'An error occurred' })
      }
    })
  }
}

export default new App().express
