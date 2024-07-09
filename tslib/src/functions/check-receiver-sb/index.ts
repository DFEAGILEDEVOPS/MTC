import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CheckReceiverServiceBus } from './check-receiver-sb'
import { type SubmittedCheckMessage } from '../../schemas/models'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'

const functionName = 'check-receiver-sb'
const checkValidationQueueName = 'check-validation'
const checkNotificationQueueName = 'check-notification'
const checkSubmissionQueueName = 'check-submission'

const checkValidationOutputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: checkValidationQueueName
})

const checkNotificationOutputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: checkNotificationQueueName
})

app.serviceBusQueue('serviceBusQueueTrigger', {
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: checkSubmissionQueueName,
  handler: serviceBusQueueTrigger,
  extraOutputs: [checkValidationOutputQueue, checkNotificationOutputQueue]
})

export async function serviceBusQueueTrigger (triggerMessage: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const submittedCheck = triggerMessage as SubmittedCheckMessage
  const version = submittedCheck.version
  const expectedVersion = SubmittedCheckVersion.V3
  context.info(`${functionName}: version:${version} message received for checkCode ${submittedCheck.checkCode}`)
  const receiver = new CheckReceiverServiceBus()
  try {
    if (version.toString() !== expectedVersion.toString()) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported. Expected version:${expectedVersion}.`)
    }
    await receiver.process(context, submittedCheck)
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
