import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CheckReceiver } from './check-receiver'
import { type SubmittedCheckMessage } from '../../schemas/models'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'
const functionName = 'check-receiver'
const checkValidationQueueName = 'check-validation'
const checkNotificationQueueName = 'check-notification'

const checkValidationOutputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: checkValidationQueueName
})

const checkNotificationOutputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: checkNotificationQueueName
})

app.storageQueue('storageQueueTrigger', {
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  queueName: 'check-submitted',
  handler: storageQueueTrigger,
  extraOutputs: [checkValidationOutputQueue, checkNotificationOutputQueue]
})

export async function storageQueueTrigger (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const submittedCheck = triggerInput as SubmittedCheckMessage
  const version = submittedCheck.version
  context.info(`${functionName}: version:${version} message received for checkCode ${submittedCheck.checkCode}`)
  const receiver = new CheckReceiver()
  try {
    if (version !== SubmittedCheckVersion.V2) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
    const outputs = await receiver.process(context, submittedCheck)
    context.extraOutputs.set(checkValidationQueueName, outputs.checkValidationQueue)
    context.extraOutputs.set(checkNotificationQueueName, outputs.checkNotificationQueue)
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
