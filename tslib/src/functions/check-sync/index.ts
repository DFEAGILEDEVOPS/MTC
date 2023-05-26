import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PreparedCheckSyncService } from './prepared-check-sync.service'
import { type IPreparedCheckSyncMessage } from './IPreparedCheckSyncMessage'
const functionName = 'check-sync'

/**
 * Synchronise access arrangements from SQL server to the prepared check(s) for a pupil.
 * @param context
 * @param preparedCheckSyncMessage
 */
const queueTrigger: AzureFunction = async function (context: Context, preparedCheckSyncMessage: IPreparedCheckSyncMessage): Promise<void> {
  const start = performance.now()
  const version = preparedCheckSyncMessage.version
  context.log.info(`${functionName}: version:${version} message received`)
  if (version !== 1) {
    // dead letter the message
    const message = `Message schema version:${version} unsupported`
    context.log.error(message)
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
    context.log.error(`${functionName}: ERROR: ${errorMessage}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default queueTrigger
