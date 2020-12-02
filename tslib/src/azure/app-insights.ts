import * as appInsights from 'applicationinsights'
import config from '../config'

const appInsightsHelper = {
  startInsightsIfConfigured: (cloudRole: string) => {
    if (config.ApplicationInsights.Key !== undefined) {
      appInsights.setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(config.ApplicationInsights.CollectExceptions)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(false)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(config.ApplicationInsights.LiveMetrics)
        .start()
      let buildNumber
      try {
        buildNumber = 'NOT IMPLEMENTED'
      } catch (error) {
        buildNumber = 'NOT FOUND'
      }
      appInsights.defaultClient.commonProperties = {
        buildNumber
      }
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRole
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.ApplicationInsights.InstanceId
    }
  }
}

export = appInsightsHelper
