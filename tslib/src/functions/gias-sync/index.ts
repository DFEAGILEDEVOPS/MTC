import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'gias-sync'

const timerTrigger: AzureFunction = async function (context: Context, timer: any): Promise<void> {
  const start = performance.now()
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default timerTrigger
