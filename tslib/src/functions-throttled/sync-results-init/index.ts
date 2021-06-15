import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SyncResultsInitService } from './sync-results-init.service'
// import * as util from 'util'

const functionName = 'sync-results-init'
// const inspect = (myObject: any): void => console.log(util.inspect(myObject, false, null, true /* enable colors */))

const timerTrigger: AzureFunction = async function (context: Context): Promise<void> {
  const start = performance.now()
  const meta = { processCount: 0, errorCount: 0 }
  try {
    const syncResultsInitService = new SyncResultsInitService(context.log)
    const messages = await syncResultsInitService.getCheckDataMessages()
    // console.log(inspect(messages))
    context.bindings.checkCompletion = messages
    meta.processCount = messages.length
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }
  const memoryUsage = process.memoryUsage()
  const heapUsed = memoryUsage.heapUsed / 1024 / 1024
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} processed ${meta.processCount} records, run took ${Math.round(durationInMilliseconds * 100) / 100} ms, total memory usage (heap used) ${Math.round(heapUsed * 100) / 100}MB`)
}

export default timerTrigger
