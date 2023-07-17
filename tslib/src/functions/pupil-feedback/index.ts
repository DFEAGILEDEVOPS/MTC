import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type IPupilFeedbackMessage, PupilFeedbackService, type IPupilFeedbackFunctionBinding } from './feedback.service'

const functionName = 'pupil-feedback'
const service = new PupilFeedbackService()

const queueTrigger: AzureFunction = async function (context: Context, feedbackMessage: IPupilFeedbackMessage): Promise<void> {
  const start = performance.now()
  const version = feedbackMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${feedbackMessage.checkCode}`)
  try {
    if (version !== 2) {
      // dead letter the message as we no longer support below v2
      throw new Error(`Message schema version:${version} unsupported`)
    }
    service.process(context.bindings as IPupilFeedbackFunctionBinding, feedbackMessage)
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
