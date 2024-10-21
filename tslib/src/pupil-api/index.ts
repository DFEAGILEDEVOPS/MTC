import appInsightsHelper from './helpers/app-insights'
import config from './config'
import * as http from 'http'
import logger from './services/log.service'
import App from './App'

appInsightsHelper.startInsightsIfConfigured().catch(err => console.error('Failed to load appinsights: ', err))
const port = normalizePort(config.PORT)
App.set('port', port)
const startDate = new Date()

logger.info(`pupil-api: ${startDate.toISOString()} [${config.Environment}] server listening on port ${port}`)

const server = http.createServer(App)
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

function normalizePort (val: number | string): number | string | boolean {
  const port: number = (typeof val === 'string') ? parseInt(val, 10) : val
  if (isNaN(port)) return val
  else if (port >= 0) return port
  else return false
}

function onError (error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') throw error
  const bind = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port}`
  /* eslint-disable no-fallthrough */
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
    default:
      throw error
  }
  /* eslint-enable no-fallthrough */
}

function onListening (): void {
  const addr = server.address()
  const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr?.port}`
  logger.info(`pupil-api up on ${bind}`)
}
