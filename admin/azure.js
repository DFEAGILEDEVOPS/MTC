const appInsights = require('applicationinsights')
const config = require('./config')
const { getBuildId } = require('./helpers/healthcheck')

const azure = {
  /**
   * identify if the environment is azure
   */
  isAzure: () => {
    return process.env.KUDU_APPPATH !== undefined
  },
  startInsightsIfConfigured: () => {
    if (config.Logging.ApplicationInsights.Key) {
      appInsights.setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(false)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(false)
        .setUseDiskRetryCaching(true)
        .start()

      let buildNumber
      try {
        buildNumber = await getBuildNumber()
      } catch (error) {
        buildNumber = 'NOT FOUND'
      }
      appInsights.defaultClient.commonProperties = {
        buildNumber
      };
    }
  }
}

module.exports = azure
