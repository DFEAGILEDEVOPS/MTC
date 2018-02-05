const appInsights = require('applicationinsights')

const azure = {
  /**
   * identify if the environment is azure
   */
  isAzure: () => {
    return process.env.KUDU_APPPATH !== undefined
  },
  startInsightsIfConfigured: () => {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
      appInsights.setup().start()
    }
  }
}

module.exports = azure
