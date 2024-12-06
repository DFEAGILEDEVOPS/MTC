import { PingService } from '../services/ping.service'
import config from '../config'
import { isNil } from 'ramda'

const appInsights = require('applicationinsights')
const cloudRoleName = 'Pupil-API'
let isAppInsightsSetup = false

const connectionString = config.Logging.ApplicationInsights.ConnectionString
if (isNil(connectionString)) {
  console.log('App Insights connection string not configured - app insights is disabled')
} else {
  console.log(`App insights config found: ${connectionString}`)
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

  isAppInsightsSetup = true
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRoleName
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRoleInstance] = config.Logging.ApplicationInsights.InstanceId
}

const appInsightsHelper = {
  startInsightsIfConfigured: async () => {
    if (!isAppInsightsSetup) {
      return
    }
    appInsights.start()
    console.log('Application insights: started')
    const pingService = new PingService()
    let buildNumber
    try {
      buildNumber = await pingService.getBuildNumber()
    } catch (error) {
      buildNumber = 'NOT FOUND'
    }
    appInsights.defaultClient.commonProperties = {
      buildNumber
    }
  }
}

export default appInsightsHelper
