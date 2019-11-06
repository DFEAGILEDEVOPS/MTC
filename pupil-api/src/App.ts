'use strict'

import 'dotenv/config'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as helmet from 'helmet'
import * as uuidV4 from 'uuid/v4'
import * as appInsights from './helpers/app-insights'
const corsOptions = require('./helpers/cors-options')
const setupLogging = require('./helpers/logger')
import logger from './services/log.service'
import { rateLimit } from './helpers/rate-limit'
import config from './config'
import authRoutes from './routes/auth'
import pingRoute from './routes/ping'
import * as R from 'ramda'
import * as featureToggles from 'feature-toggles'

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application

  // Run configuration methods on the Express instance.
  constructor () {
    this.express = express()
    this.middleware()
    this.routes()
    this.featureToggles()
    appInsights.startInsightsIfConfigured().catch(e => logger.error(e))
  }

  private featureToggles (): void {
    /**
     * Load feature toggles
     */
    logger.info('ENVIRONMENT_NAME : ' + config.Environment)
    const environmentName = config.Environment
    let featureTogglesSpecific: string
    let featureTogglesDefault: string
    let featureTogglesSpecificPath: string
    let featureTogglesDefaultPath: string
    try {
      featureTogglesSpecificPath = './config/feature-toggles.' + environmentName
      featureTogglesSpecific = environmentName ? require(featureTogglesSpecificPath) : null
    } catch (err) {
      logger.warn('error loading feature toggles:', err.message)
    }

    try {
      featureTogglesDefaultPath = './config/feature-toggles.default'
      featureTogglesDefault = require(featureTogglesDefaultPath)
    } catch (err) {
      logger.warn('error loading feature toggles:', err.message)
    }

    const featureTogglesMerged = R.mergeRight(featureTogglesDefault, featureTogglesSpecific)

    if (featureTogglesMerged) {
      logger.info(`Loading merged feature toggles from '${featureTogglesSpecificPath}', '${featureTogglesDefaultPath}': `, featureTogglesMerged)
      featureToggles.load(featureTogglesMerged)
    }
  }

  // Configure Express middleware.
  private middleware (): void {

    /* Logging */

    setupLogging(this.express)

    /* Security Directives */

    this.express.use(cors(corsOptions))
    this.express.use(helmet())

    /* Swagger API documentation */

    if (process.env.NODE_ENV !== 'production') {
      const swaggerUI = require('swagger-ui-express')
      this.express.use('/api-docs', swaggerUI.serve, swaggerUI.setup(require('./swagger.json')))
    }

    // Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
    const oneYearInSeconds = 31536000
    this.express.use(helmet.hsts({
      maxAge: oneYearInSeconds,
      includeSubDomains: true,
      preload: true
    }))

     // rate limit requests
    this.express.use(async (req, res, next) => {
      try {
        if (!config.RateLimit.Enabled) {
          return next()
        }
        await rateLimit(req)
        next()
      } catch (error) {
        // Rate limit exceeded
        next(error)
      }
    })

    this.express.use(bodyParser.json())
  }

  // Configure API endpoints.
  private routes (): void {
    /* API endpoints */
    this.express.use('/ping', pingRoute)
    this.express.use('/auth', authRoutes)

    if (process.env.VERIFY_OWNER) {
      const token = process.env.VERIFY_OWNER
      this.express.get(`/${token}`, (req, res) => {
        res.contentType('text/plain')
        res.send(token)
      })
    }

    // catch 404 and forward to error handler
    this.express.use(function (req, res, next) {
      let err: any = new Error('Not Found')
      err.status = 404
      next(err)
    })

    // error handler
    this.express.use(function (err, req, res, next) {
      const errorId = uuidV4()
      // only providing error information in development
      // @TODO: change this to a real logger with an error string that contains
      // all pertinent information. Assume 2nd/3rd line support would pick this
      // up from logging web interface (e.g. ELK / LogDNA)
      logger.error(`ERROR: ${err.message} ID: ${errorId}`, err)

      // return the error as an JSON object
      err.message = err.message || 'An error occurred'
      err.errorId = errorId
      err.status = err.status || 500
      if (req.app.get('env') === 'development') {
        res.status(err.status).json({ error: err.message, errorId: errorId })
      } else {
        res.status(err.status).json({ error: 'An error occurred' })
      }
    })

  }

}

export default new App().express
