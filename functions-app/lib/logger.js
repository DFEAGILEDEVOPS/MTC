'use strict'

module.exports = {
  /**
   * context.log function when executed in Azure Functions
   * logger should have methods: error, warn, info, verbose
   */
  logger: () => {},
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
