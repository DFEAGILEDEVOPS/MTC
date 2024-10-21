import * as appInsights from 'applicationinsights'
import config from '../config'
import { isNotNil } from 'ramda'

const appInsightsHelper = {
  startInsightsIfConfigured: (cloudRole: string) => {
    if (isNotNil(config.ApplicationInsights.Key)) {
      console.log('initialising application insights module')
      appInsights.setup(config.ApplicationInsights.ConnectionString)
        .setAutoCollectRequests(true)
        // setAutoCollectPerformance() - for some reason this next call causes a configuration warning 'Extended metrics are no longer supported. ...'
        .setAutoCollectPerformance(true, false)
        .setAutoCollectExceptions(config.ApplicationInsights.CollectExceptions)
        .setAutoCollectDependencies(config.ApplicationInsights.CollectDependencies)
        .setAutoCollectConsole(true)
        .setAutoCollectPreAggregatedMetrics(true)
        .setSendLiveMetrics(config.ApplicationInsights.LiveMetrics)
        .setInternalLogging(false, true)
        .enableWebInstrumentation(false)
        .start()
      // let buildNumber
      // try {
      //   buildNumber = 'NOT IMPLEMENTED'
      // } catch (error) {
      //   buildNumber = 'NOT FOUND'
      // }
      // appInsights.defaultClient.commonProperties = {
      //   buildNumber
      // }
      // appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRole
      // appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.ApplicationInsights.InstanceId
    }
  }
}

export default appInsightsHelper
