import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'

const functionName = 'sync-results-to-sql'

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  const start = performance.now()
  if (myTimer.IsPastDue) {
    context.log(`${functionName}: Timer function is running late!`)
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default timerTrigger
