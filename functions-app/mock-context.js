'use strict'
const R = require('ramda')
const logFunc = function (level = 'INFO') { /* console.log(`[${level.toUpperCase()}]: `, ...R.tail(Array.from(arguments))) */ }

module.exports = {
  bindings: {},
  log: (function () {
    const logHandler = R.partial(logFunc, ['info'])
    logHandler.verbose = R.partial(logFunc, ['verbose'])
    logHandler.info = R.partial(logFunc, ['info'])
    logHandler.error = R.partial(logFunc, ['error'])
    return logHandler
  }()), // whoo-hoo: a function with properties.  Your enthusiasm may vary.
  done: function () {}
}
