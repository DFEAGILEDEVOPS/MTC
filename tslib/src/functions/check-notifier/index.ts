import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { ICheckNotificationMessage } from './check-notification-message'
const functionName = 'check-notifier'

const serviceBusTrigger: AzureFunction = async function (context: Context, checkNotification: ICheckNotificationMessage): Promise<void> {
  const start = performance.now()
  const version = checkNotification.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${checkNotification.checkCode}`)
  try {
    if (version !== 1) {
      // dead letter the message as currently we only support v1
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

export default serviceBusTrigger
