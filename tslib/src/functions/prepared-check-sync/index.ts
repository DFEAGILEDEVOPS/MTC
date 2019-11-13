import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'prepared-check-sync'

const queueTrigger: AzureFunction = async function (context: Context, preparedCheckSyncMessage: IPreparedCheckSyncMessage): Promise<void> {
  const start = performance.now()
  const version = preparedCheckSyncMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${preparedCheckSyncMessage.checkCode}`)
  try {
    if (version !== 1) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default queueTrigger

export interface IPreparedCheckSyncMessage {
  version: number
}
