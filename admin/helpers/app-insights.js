'use strict'

const appInsights = require('applicationinsights')
const config = require('../config')
const {
  getBuildNumber
} = require('./healthcheck')

const startInsightsIfConfigured = async () => {
  if (config.Monitoring.ApplicationInsights.Key) {
    console.log('initialising application insights module')
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
    appInsights.defaultClient.context.tags['ai.cloud.role'] = 'Admin-App'
    appInsights.defaultClient.context.tags['ai.cloud.roleInstance'] = config.Monitoring.ApplicationInsights.InstanceId
  }
}

module.exports = {
  startInsightsIfConfigured
}
