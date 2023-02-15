import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import helmet from 'helmet'
import { v4 as uuidv4 } from 'uuid'
import * as appInsights from './helpers/app-insights'
import logger from './services/log.service'
import authRoutes from './routes/auth'
import pingRoute from './routes/ping'
import headRoute from './routes/head'
import * as corsOptions from './helpers/cors-options'
import { initLogger } from './helpers/logger'
import * as swagger from 'swagger-ui-express'
import swaggerConfig from './swagger.json'

const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')
try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    dotenv.config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

// Creates and configures an ExpressJS web server.
class App {
  // ref to Express instance
  public express: express.Application

  // Run configuration methods on the Express instance.
  constructor () {
    this.express = express()
    this.middleware()
    this.routes()
    appInsights.startInsightsIfConfigured().catch(e => { logger.error(e) })
  }

  // Configure Express middleware.
  private middleware (): void {
    /* Logging */

    initLogger(this.express)

    /* Security Directives */

    this.express.use(cors(corsOptions))
    this.express.use(helmet())

    /* Swagger API documentation */

    if (process.env.NODE_ENV !== 'production') {
      this.express.use('/api-docs', swagger.serve, swagger.setup(swaggerConfig))
    }

    // Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
    const oneYearInSeconds = 31536000
    this.express.use(helmet.hsts({
      maxAge: oneYearInSeconds,
      includeSubDomains: true,
      preload: true
    }))
    this.express.use(bodyParser.json())
  }

  // Configure API endpoints.
  private routes (): void {
    /* API endpoints */
    this.express.use('/ping', pingRoute)
    this.express.use('/auth', authRoutes)
    this.express.use(headRoute)

    if (process.env.VERIFY_OWNER !== undefined) {
      const token = process.env.VERIFY_OWNER
      this.express.get(`/${token}`, (req, res) => {
        res.contentType('text/plain')
        res.send(token)
      })
    }

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
