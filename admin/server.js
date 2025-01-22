#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('./app')
const http = require('http')
const config = require('./config')
const logger = require('./services/log.service').getLogger()

/**
 * Global variable declarations
 * Variables scoped with var here will be added to the node `global` object
 */

// eslint-disable-next-line
var checkWindowPhase = require('./lib/consts/check-window-phase').unavailable // default - get's overridden in middleware on each request

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(config.PORT)
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)
logger.info(`${config.Environment} server listening on port ${port}`)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    // eslint-disable-next-line no-fallthrough
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    // eslint-disable-next-line no-fallthrough
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  logger.debug('Listening on ' + bind)
  logger.debug(`http://localhost:${port}`)
}
