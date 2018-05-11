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
      appInsights.setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(false)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(false)
        .setUseDiskRetryCaching(true)
        .start()
    }
  }
}

export = azure
