import * as appInsights from 'applicationinsights'
import config from '../config'

const appInsightsHelper = {
  startInsightsIfConfigured: async (cloudRole: string) => {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
      appInsights.setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(config.ApplicationInsights.CollectExceptions)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(false)
        .setUseDiskRetryCaching(true)
        .start()

      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRole
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.ApplicationInsights.InstanceId
    }
  }
}

export = appInsightsHelper
