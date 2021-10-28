import * as appInsights from 'applicationinsights'
import { PingController } from '../controllers/ping.controller'
import config from '../config'
import * as parser from './parsing'

const pingController = new PingController()

const appInsightsHelper = {
  startInsightsIfConfigured: async () => {
    if (parser.propertyExists(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')) {
      appInsights.setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(config.Logging.ApplicationInsights.CollectExceptions)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(false)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(config.Logging.ApplicationInsights.LiveMetrics)
        .start()

      let buildNumber
      try {
        buildNumber = await pingController.getBuildNumber()
      } catch (error) {
        buildNumber = 'NOT FOUND'
      }
      appInsights.defaultClient.commonProperties = {
        buildNumber
      }
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'Pupil-Auth-Api'
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.Logging.ApplicationInsights.InstanceId
    }
  }
}

export = appInsightsHelper
