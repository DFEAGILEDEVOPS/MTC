import { app, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type ICheckStartedMessage, CheckStartedService } from './check-started.service'
import * as os from 'os'
const functionName = 'check-started'

app.storageQueue('checkStartedQueueTrigger', {
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  queueName: 'check-started',
  handler: checkStartedFunction
})

export async function checkStartedFunction (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const checkStartedMessage = triggerInput as ICheckStartedMessage
  const version = checkStartedMessage.version
  context.info(`${functionName}: version:${version} message received for checkCode ${checkStartedMessage.checkCode}`)

  try {
    if (version !== 1) {
      // dead letter the message as we only support v1
      throw new Error(`Message schema version:${version} unsupported`)
    }
    const checkStartedService = new CheckStartedService()
    await checkStartedService.process(checkStartedMessage)
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
