import { type Timer, app, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type ISyncResultsInitServiceOptions, SyncResultsInitService } from './sync-results-init.service'
import './../../common/bigint'
const functionName = 'sync-results-init'

// This is usually in GMT so 5pm GMT is equal to 6pm BST (wall clock time in summer)
// Timezones are now supported: https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer?tabs=python-v2%2Cisolated-process%2Cnodejs-v4&pivots=programming-language-javascript#ncrontab-time-zones
app.timer(functionName, {
  schedule: '0 0 17 * * *',
  handler: syncResultsInit
})

export async function syncResultsInit (timer: Timer, context: InvocationContext): Promise<void> {
  if (timer.isPastDue) {
    // This function could potentially deliver a lot of work to the functions, and none of it is urgent. No surprises!
    context.log(`${functionName}: timer is past due, exiting.`)
    return
  }
  const start = performance.now()
  try {
    const syncResultsInitService = new SyncResultsInitService(context)
    // If called via http there could be a message passed in
    // TODO this might not be the correct way to access the http inputs
    const options: ISyncResultsInitServiceOptions = context.triggerMetadata ?? {}
    const meta = await syncResultsInitService.processBatch(options)
    const memoryUsage = process.memoryUsage()
    const heapUsed = memoryUsage.heapUsed / 1024 / 1024
    const end = performance.now()
    const durationInMilliseconds = end - start
    const timeStamp = new Date().toISOString()
    context.log(`${functionName}: ${timeStamp} processed ${meta.messagesSent} records with ${meta.messagesErrored} messages failed to send, run took ${Math.round(durationInMilliseconds) / 1000} secs, total memory usage (heap used) ${Math.round(heapUsed * 100) / 100} MB`)
  } catch (error: any) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${functionName}: ERROR: ${errorMessage}`)
    throw error
  }
}
