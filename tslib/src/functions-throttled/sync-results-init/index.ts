import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SyncResultsInitService } from './sync-results-init.service'

const functionName = 'sync-results-init'

const timerTrigger: AzureFunction = async function (context: Context): Promise<void> {
  const start = performance.now()
  try {
    const syncResultsInitService = new SyncResultsInitService(context.log)
    const meta = await syncResultsInitService.processBatch()
    const memoryUsage = process.memoryUsage()
    const heapUsed = memoryUsage.heapUsed / 1024 / 1024
    const end = performance.now()
    const durationInMilliseconds = end - start
    const timeStamp = new Date().toISOString()
    context.log(`${functionName}: ${timeStamp} processed ${meta.messagesSent} records with ${meta.messagesErrored} messages failed to send, run took ${Math.round(durationInMilliseconds * 100) / 100} ms, total memory usage (heap used) ${Math.round(heapUsed * 100) / 100}MB`)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }
}

export default timerTrigger
