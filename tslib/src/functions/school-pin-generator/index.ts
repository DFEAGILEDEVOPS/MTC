import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'school-pin-generator'

const schoolPinGenerator: AzureFunction = async function (context: Context, timer: any): Promise<void> {

  const start = performance.now()
  // TODO: configure cron schedule
  // TODO: execute pin generator
  finish(start, context)
}

function finish (start: number, context: Context) {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
  context.done()
}

export default schoolPinGenerator
