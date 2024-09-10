'use strict'

const appInsights = require('applicationinsights')
const config = require('../config')
// const {
//   getBuildNumber
// } = require('./healthcheck')

const startInsightsIfConfigured = async () => {
  if (config.Monitoring.ApplicationInsights.ConnectionString) {
    console.log('initialising application insights module')
    appInsights.setup()
      .setAutoCollectRequests(true)
      // setAutoCollectPerformance() - for some reason this next call causes a configuration warning 'Extended metrics are no longer supported. ...'
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(config.Monitoring.ApplicationInsights.CollectExceptions)
      .setAutoCollectDependencies(config.Monitoring.ApplicationInsights.CollectDependencies)
      .setAutoCollectConsole(false)
      .setAutoCollectPreAggregatedMetrics(true)
      .setSendLiveMetrics(config.Monitoring.ApplicationInsights.LiveMetrics)
      .setInternalLogging(false, true)
      .enableWebInstrumentation(false)
      .start()

    // Commented out in ticket #65031 as part of maintenance upgrades
    // V3 of the appinsights sdk does not support context/commonProperties
    //   let buildNumber
    //   try {
    //     buildNumber = await getBuildNumber()
    //   } catch (error) {
    //     buildNumber = 'NOT FOUND'
    //   }
    //   appInsights.defaultClient.commonProperties = {
    //     buildNumber
    //   }
    //   appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'Admin-App'
    //   appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.Monitoring.ApplicationInsights.InstanceId
  }
}

module.exports = {
  startInsightsIfConfigured
}
