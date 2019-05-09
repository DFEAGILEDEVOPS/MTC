'use strict'

module.exports = {
  /**
   * context.log function when executed in Azure Functions
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
