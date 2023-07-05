import config from '../config'
import logger from '../services/log.service'
import morgan from 'morgan'

let initialised: boolean

export function initLogger (app: any): void {
  if (initialised) return

  if (config.Logging.Express.UseWinston) {
    /**
     * Express logging to winston
     */
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const expressWinston = require('express-winston')
    app.use(expressWinston.logger({ winstonInstance: logger }))
  } else {
    app.use(morgan('dev'))
  }

  initialised = true
}
