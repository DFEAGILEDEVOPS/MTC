import { app, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PreparedCheckSyncService } from './prepared-check-sync.service'
import { type IPreparedCheckSyncMessage } from './IPreparedCheckSyncMessage'
const functionName = 'check-sync'

app.serviceBusQueue('serviceBusQueueTrigger', {
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-sync',
  handler: serviceBusQueueTrigger
})

/**
 * Synchronise access arrangements from SQL server to the prepared check(s) for a pupil.
 * @param context
 * @param preparedCheckSyncMessage
 */
export async function serviceBusQueueTrigger (triggerMessage: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const preparedCheckSyncMessage = triggerMessage as IPreparedCheckSyncMessage
  const version = preparedCheckSyncMessage.version
  context.info(`${functionName}: version:${version} message received`)
  if (version !== 1) {
    // dead letter the message
    const message = `Message schema version:${version} unsupported`
    context.error(message)
    throw new Error(message)
  }
  try {
    const prepCheckSyncService = new PreparedCheckSyncService()
    await prepCheckSyncService.process(preparedCheckSyncMessage.pupilUUID)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${functionName}: ERROR: ${errorMessage}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
