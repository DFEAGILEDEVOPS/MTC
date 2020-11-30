const functionName = 'school-pin-generator'
import aiHelper from '../../azure/app-insights'
// load early to enable tracking
aiHelper.startInsightsIfConfigured(functionName)

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolPinReplenishmnentService } from './school-pin-replenishment.service'

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const schoolPinGenerator: AzureFunction = async function (context: Context): Promise<void> {
  const start = performance.now()
  const replenishmentService = new SchoolPinReplenishmnentService()
  await replenishmentService.process(context.log)
  finish(start, context)
}

export default schoolPinGenerator
