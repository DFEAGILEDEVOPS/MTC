import * as appInsights from 'applicationinsights'
// import { PingService } from '../services/ping.service'
import config from '../config'
import { isNotNil } from 'ramda'

// const pingService = new PingService()

const appInsightsHelper = {
  startInsightsIfConfigured: (): void => {
    if (isNotNil(config.Logging.ApplicationInsights.ConnectionString)) {
      console.log('initialising application insights module')
      appInsights.setup(config.Logging.ApplicationInsights.ConnectionString)
        .setAutoCollectRequests(true)
        // setAutoCollectPerformance() - for some reason this next call causes a configuration warning 'Extended metrics are no longer supported. ...'
        .setAutoCollectPerformance(true, false)
        .setAutoCollectExceptions(config.Logging.ApplicationInsights.CollectExceptions)
        .setAutoCollectDependencies(config.Logging.ApplicationInsights.CollectDependencies)
        .setAutoCollectConsole(true)
        .setAutoCollectPreAggregatedMetrics(true)
        .setSendLiveMetrics(config.Logging.ApplicationInsights.LiveMetrics)
        .setInternalLogging(false, true)
        .enableWebInstrumentation(false)
        .start()

      // let buildNumber
      // try {
      //   buildNumber = await pingService.getBuildNumber()
      // } catch (error) {
      //   buildNumber = 'NOT FOUND'
      // }
      // appInsights.defaultClient.commonProperties = {
      //   buildNumber
      // }
      // appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'Pupil-Auth-Api'
      // appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.Logging.ApplicationInsights.InstanceId
    }
  }
}

export = appInsightsHelper
