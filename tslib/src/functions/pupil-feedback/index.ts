import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type IPupilFeedbackMessage, PupilFeedbackService } from './feedback.service'

const functionName = 'pupil-feedback'
const service = new PupilFeedbackService()

const outputTable = output.table({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  tableName: 'pupilFeedback'
})

app.storageQueue(functionName, {
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  queueName: 'pupil-feedback',
  handler: pupilFeedback,
  extraOutputs: [outputTable]
})

export async function pupilFeedback (triggerMessage: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const feedbackMessage = triggerMessage as IPupilFeedbackMessage
  const version = feedbackMessage.version
  context.info(`${functionName}: version:${version} message received for checkCode ${feedbackMessage.checkCode}`)
  try {
    if (version !== 2) {
      // dead letter the message as we no longer support below v2
      throw new Error(`Message schema version:${version} unsupported`)
    }
    const output = service.process(feedbackMessage)
    context.extraOutputs.set(outputTable, output.feedbackTable)
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
