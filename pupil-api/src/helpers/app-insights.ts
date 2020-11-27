import * as appInsights from 'applicationinsights'
import PingController from '../controllers/ping.controller'
import config from '../config'

const appInsightsHelper = {
  startInsightsIfConfigured: async () => {
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

      let buildNumber
      try {
        buildNumber = await PingController.getBuildNumber()
      } catch (error) {
        buildNumber = 'NOT FOUND'
      }
      appInsights.defaultClient.commonProperties = {
        buildNumber
      }
      appInsights.defaultClient.context.tags['ai.cloud.role'] = 'Pupil-Auth-Api'
      appInsights.defaultClient.context.tags['ai.cloud.roleInstance'] = config.Logging.ApplicationInsights.InstanceId
    }
  }
}

export = appInsightsHelper
