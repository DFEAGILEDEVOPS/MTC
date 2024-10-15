// import { PingService } from '../services/ping.service'
import config from '../config'
import { isNotNil } from 'ramda'
const appInsights = require('applicationinsights')

// const pingService = new PingService()

const cloudRoleName = 'Pupil-API'
// appinsights v3.3.0 (is/may be) unable to accurately instrument ESM code. See this important information
// https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md#instrumentation-hook-required-for-esm
// Stick with applicationinsights v2 until this can be resolved.
if (isNotNil(config.Logging.ApplicationInsights.Key)) {
  console.debug('initialising application insights module')
  appInsights.setup(config.Logging.ApplicationInsights.Key)
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
  appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = cloudRoleName
  appInsights.start()
  appInsights.client = appInsights.defaultClient
  appInsights.client.setAutoPopulateAzureProperties()
}
