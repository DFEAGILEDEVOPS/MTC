'use strict'

const appInsights = require('applicationinsights')
const config = require('../config')
const {
  getBuildNumber
} = require('./healthcheck')

const startInsightsIfConfigured = async () => {
  if (config.Monitoring.ApplicationInsights.Key) {
    appInsights.setup()
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(config.Monitoring.ApplicationInsights.CollectExceptions)
      .setAutoCollectDependencies(config.Monitoring.ApplicationInsights.CollectDependencies)
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
    }
  }
}

module.exports = {
  startInsightsIfConfigured
}
