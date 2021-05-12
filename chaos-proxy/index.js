const http = require('http')
const chaosProxy = require('./chaos-proxy')

const app = http.createServer(chaosProxy.handle)
const port = normalizePort(process.env.PORT || 3004)
app.listen(port)
console.log('listening on ', port)

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