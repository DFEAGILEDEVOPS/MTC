#!/usr/bin/env node

/**
 * Module dependencies.
 */
'use strict'
const app = require('./app')
const debug = require('debug')('mtc-app-poc:server')
const http = require('http')
const cluster = require('cluster')
const numCpus = require('os').cpus().length
const config = require('./config')

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.PORT || '3000')
app.set('port', port)
let server

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < numCpus; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
  })
} else {
  /**
   * Create HTTP server.
   */

  server = http.createServer(app)

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
  console.log('Server listening on port ' + port)
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10)

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

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address()
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}
