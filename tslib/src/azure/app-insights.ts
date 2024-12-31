import config from '../config'
import { isNil } from 'ramda'
import * as appInsights from 'applicationinsights'

const cloudRoleName = 'TsLib'

const connectionString = config.ApplicationInsights.ConnectionString
if (isNil(connectionString)) {
  console.log('App Insights connection string not configured - app insights is disabled')
} else {
  console.log('App insights config found')
  appInsights.setup(connectionString)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, false)
    .setUseDiskRetryCaching(true)
    .setAutoCollectPreAggregatedMetrics(true)
    .setSendLiveMetrics(false)
    .setAutoCollectHeartbeat(false)
    .setAutoCollectIncomingRequestAzureFunctions(true)
    .setInternalLogging(false, true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .enableWebInstrumentation(false)
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRoleName // default
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.ApplicationInsights.InstanceId
}

const appInsightsHelper = {
  startInsightsIfConfigured: async (cloudRole = 'TsLib (default)'): Promise<void> => {
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRole
    appInsights.start()
    console.log(`TSLib Application insights: started for role [${cloudRole}]`)
    let buildNumber
    try {
      buildNumber = 'NOT IMPLEMENTED'
    } catch {
      buildNumber = 'NOT FOUND'
    }
    appInsights.defaultClient.commonProperties = {
      buildNumber
    }
  }
}

export default appInsightsHelper
