import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IPupilFeedbackMessage, PupilFeedbackService } from './feedback.service'
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
    service.process(context, feedbackMessage)
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
