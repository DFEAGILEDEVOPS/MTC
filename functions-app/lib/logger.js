'use strict'
const R = require('ramda')
const logFunc = function (level = 'INFO') { console.log(`[${level.toUpperCase()}]: `, ...R.tail(Array.from(arguments))) }

module.exports = {
  /**
   * context.log function when executed in Azure Functions
   * logger should have methods: error, warn, info, verbose
   */
  logger: (function () {
    const logHandler = R.partial(logFunc, ['info'])
    logHandler.verbose = R.partial(logFunc, ['verbose'])
    logHandler.info = R.partial(logFunc, ['info'])
    logHandler.error = R.partial(logFunc, ['error'])
    return logHandler
  }()),
  /**
   * Logger setter
   * @param loggerFunc
   * @return {this}
   */
  setLogger: function (loggerFunc) {
    this.logger = loggerFunc
    return this
  }
}
