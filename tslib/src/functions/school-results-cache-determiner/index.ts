import { AzureFunction, Context } from '@azure/functions'
import { SchoolResultsCacheDeterminerService } from './school-results-cache-determiner.service'

const functionName = 'school-results-cache-determiner'
import { performance } from 'perf_hooks'

function finish (start: number, context: Context) {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const schoolResultsCacheDeterminer: AzureFunction = async function (context: Context, msg: any): Promise<void> {
  context.log('ServiceBus queue trigger function processed message', msg)
  const cacheDeterminerService = new SchoolResultsCacheDeterminerService(context.bindings, context.log, undefined)
  await cacheDeterminerService.execute()
  const start = performance.now()
  finish(start, context)
}

export default schoolResultsCacheDeterminer
