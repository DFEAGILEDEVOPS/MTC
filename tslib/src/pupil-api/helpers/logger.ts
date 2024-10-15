import morgan from 'morgan'
import config, { LocalDev } from '../config'

let initialised: boolean

export function initLogger (app: any): void {
  if (initialised) return

  // We only want to output http logs if we are in development mode, as on live we can't access this outut (it will be
  // logged to the container) and it will decrease performance.
  if (config.Environment === LocalDev) {
    console.info('Local dev detected: setting request logging')
    app.use(morgan('dev'))
  }

  initialised = true
}
